# ===========================================================================
# Twenty CRM — Hardened Single-Container Production Image for Render
#
# Runs inside the container:  server (NestJS + React frontend) + worker (BullMQ) + Redis
# External (Render managed):  Postgres — passed in via PG_DATABASE_URL at runtime
#
# Base image strategy
# -------------------
# Build stages  → node:24.15.0-alpine3.23 pinned by SHA256 digest
#                 (byte-for-byte identical to Twenty's own CI build environment)
#
# Runtime stage → dhi.io/node:24-alpine3.23-dev  (Docker Hardened Image)
#                 - Apache 2.0, free tier, no subscription required
#                 - Alpine 3.23 variant: retains apk + sh so we can install
#                   redis, postgresql-client, curl, jq, and s6-overlay
#                 - Near-zero CVEs (rebuilt nightly from source)
#                 - Ships with SBOM, SLSA provenance, and Sigstore signatures
#                 - Requires Docker Hub credentials: docker login dhi.io
#                   Configure in Render under Advanced > Registry Credential
#
# Process model (s6-overlay as PID 1 supervises all three processes)
# -----------------------------------------------------------------
#   1. redis          — loopback-only, in-container, no persistence
#   2. twenty-server  — NestJS API + React static files, port 3000
#   3. twenty-worker  — BullMQ background job processor
#
# Startup order enforced by s6 dependency graph:
#   redis must be running before twenty-server starts
#   twenty-server must be running before twenty-worker starts
# ===========================================================================

# Pinned digest matches Twenty's own Dockerfile exactly.
# https://github.com/twentyhq/twenty/blob/main/packages/twenty-docker/twenty/Dockerfile
ARG NODE_BUILDER_IMAGE=node:24.15.0-alpine3.23@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f

# ---------------------------------------------------------------------------
# Stage 1: front-deps
# Install JS dependencies for frontend packages only via Yarn workspace focus.
# ---------------------------------------------------------------------------
FROM ${NODE_BUILDER_IMAGE} AS front-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches  /app/.yarn/patches
COPY ./packages/twenty-ui/package.json                        /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json                    /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json                     /app/packages/twenty-front/
COPY ./packages/twenty-front-component-renderer/package.json  /app/packages/twenty-front-component-renderer/
COPY ./packages/twenty-sdk/package.json                       /app/packages/twenty-sdk/
COPY ./packages/twenty-client-sdk/package.json                /app/packages/twenty-client-sdk/

RUN yarn workspaces focus twenty twenty-front twenty-front-component-renderer \
        twenty-ui twenty-shared twenty-sdk twenty-client-sdk \
    && yarn cache clean \
    && npx nx reset

# ---------------------------------------------------------------------------
# Stage 2: server-deps
# Install JS dependencies for backend packages only via Yarn workspace focus.
# ---------------------------------------------------------------------------
FROM ${NODE_BUILDER_IMAGE} AS server-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches  /app/.yarn/patches
COPY ./packages/twenty-emails/package.json        /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json        /app/packages/twenty-server/
COPY ./packages/twenty-server/patches             /app/packages/twenty-server/patches
COPY ./packages/twenty-shared/package.json        /app/packages/twenty-shared/
COPY ./packages/twenty-client-sdk/package.json    /app/packages/twenty-client-sdk/

RUN yarn workspaces focus twenty twenty-server twenty-emails twenty-shared twenty-client-sdk \
    && yarn cache clean \
    && npx nx reset

# ---------------------------------------------------------------------------
# Stage 3: twenty-server-build
# Compile the NestJS server, email templates, and all i18n catalogues.
# ---------------------------------------------------------------------------
FROM server-deps AS twenty-server-build

COPY ./packages/twenty-emails      /app/packages/twenty-emails
COPY ./packages/twenty-shared      /app/packages/twenty-shared
COPY ./packages/twenty-client-sdk  /app/packages/twenty-client-sdk
COPY ./packages/twenty-server      /app/packages/twenty-server

RUN npx nx run twenty-server:lingui:extract \
    && npx nx run twenty-server:lingui:compile \
    && npx nx run twenty-emails:lingui:extract \
    && npx nx run twenty-emails:lingui:compile

RUN npx nx run twenty-server:build

# Strip type declarations and test output; keep source maps for error reporting
RUN find /app/packages/twenty-server/dist -name '*.d.ts' -delete \
    && rm -rf /app/packages/twenty-server/dist/packages/twenty-server/test

# Prune devDependencies — shrinks node_modules significantly before COPY
RUN yarn workspaces focus --production \
        twenty-emails twenty-shared twenty-client-sdk twenty-server

# ---------------------------------------------------------------------------
# Stage 4: twenty-front-build
# Compile the React frontend with Vite.
# Needs ~8 GB RAM — Render build machines provide 16 GB, so this is fine.
# First build takes 10-15 minutes; Docker layer cache makes rebuilds fast.
# ---------------------------------------------------------------------------
FROM front-deps AS twenty-front-build

COPY ./packages/twenty-front                    /app/packages/twenty-front
COPY ./packages/twenty-front-component-renderer /app/packages/twenty-front-component-renderer
COPY ./packages/twenty-ui                       /app/packages/twenty-ui
COPY ./packages/twenty-shared                   /app/packages/twenty-shared
COPY ./packages/twenty-sdk                      /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk               /app/packages/twenty-client-sdk

RUN npx nx run twenty-front:lingui:extract \
    && npx nx run twenty-front:lingui:compile

# If packages/twenty-front/build/ already exists (host pre-built), skip Vite.
# Otherwise run the full build with an enlarged heap to prevent OOM.
RUN if [ -d /app/packages/twenty-front/build ]; then \
        echo "Using pre-built frontend from host"; \
    else \
        NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front; \
    fi

# ---------------------------------------------------------------------------
# Stage 5: twenty-app (hardened runtime)
#
# dhi.io/node:24-alpine3.23-dev is the Docker Hardened Image Alpine variant.
# The -dev suffix means it keeps apk and sh, which we need for installing
# redis, postgresql18-client, curl, jq, and s6-overlay at build time.
# DHI images run as UID 1000 (node user) by default. We use USER root only
# for RUN steps that require it, then all app processes drop to UID 1000
# via s6-setuidgid inside each service's run script.
# ---------------------------------------------------------------------------
FROM dhi.io/node:24-alpine3.23-dev AS twenty-app

# All setup requires root; runtime services drop privileges via s6-setuidgid
USER root

# ---- Install s6-overlay ----
# s6-overlay is a production-grade process supervisor that runs multiple
# long-running processes under a single PID 1 inside one container.
# Twenty's own twenty-app-dev image uses exactly this pattern.
ARG S6_OVERLAY_VERSION=3.2.0.2
ARG TARGETARCH

RUN apk add --no-cache wget xz

RUN set -eux; \
    ARCH=$([ "$TARGETARCH" = "arm64" ] && echo "aarch64" || echo "x86_64"); \
    wget -q -O /tmp/s6-noarch.tar.xz \
        "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz"; \
    wget -q -O /tmp/s6-noarch.sha256 \
        "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz.sha256"; \
    wget -q -O /tmp/s6-arch.tar.xz \
        "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${ARCH}.tar.xz"; \
    wget -q -O /tmp/s6-arch.sha256 \
        "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${ARCH}.tar.xz.sha256"; \
    cd /tmp; \
    echo "$(awk '{print $1}' s6-noarch.sha256)  s6-noarch.tar.xz" | sha256sum -c -; \
    echo "$(awk '{print $1}' s6-arch.sha256)    s6-arch.tar.xz"   | sha256sum -c -; \
    tar -C / -Jxpf /tmp/s6-noarch.tar.xz; \
    tar -C / -Jxpf /tmp/s6-arch.tar.xz; \
    rm /tmp/s6-*.tar.xz /tmp/s6-*.sha256

# ---- Runtime packages ----
RUN apk add --no-cache \
        redis \
        curl \
        jq \
        postgresql18-client \
    && apk del wget xz

# ---- Copy built application artifacts ----

# Workspace root
COPY --chown=1000:1000 --from=twenty-server-build /app/package.json       /app/
COPY --chown=1000:1000 --from=twenty-server-build /app/yarn.lock          /app/
COPY --chown=1000:1000 --from=twenty-server-build /app/.yarnrc.yml        /app/
COPY --chown=1000:1000 --from=twenty-server-build /app/tsconfig.base.json /app/
COPY --chown=1000:1000 --from=twenty-server-build /app/nx.json            /app/
COPY --chown=1000:1000 --from=twenty-server-build /app/.yarn              /app/.yarn
COPY --chown=1000:1000 --from=twenty-server-build /app/node_modules       /app/node_modules

# Server package — compiled dist only, no source code in the image
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-server/package.json  /app/packages/twenty-server/
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-server/dist          /app/packages/twenty-server/dist
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-server/patches       /app/packages/twenty-server/patches

# Workspace packages — dist only
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-shared/package.json  /app/packages/twenty-shared/
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-shared/dist          /app/packages/twenty-shared/dist

COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-emails/package.json  /app/packages/twenty-emails/
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-emails/dist          /app/packages/twenty-emails/dist

COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-client-sdk/package.json  /app/packages/twenty-client-sdk/
COPY --chown=1000:1000 --from=twenty-server-build \
    /app/packages/twenty-client-sdk/dist          /app/packages/twenty-client-sdk/dist

# Frontend static files — NestJS serves them from dist/front and rewrites
# index.html with window._env_ config on every startup via generateFrontConfig()
COPY --chown=1000:1000 --from=twenty-front-build \
    /app/packages/twenty-front/build \
    /app/packages/twenty-server/dist/front

# ---- Twenty's own entrypoint script ----
# entrypoint.sh is responsible for:
#   1. Checking whether the 'core' schema exists in Postgres via psql
#   2. If empty DB: running yarn database:init:prod
#   3. Running yarn command:prod upgrade (migrations + cache flush)
#   4. Running yarn command:prod cron:register:all (unless DISABLE_CRON_JOBS_REGISTRATION=true)
#   5. exec-ing its argument (node dist/main for the server service)
# This script only runs for twenty-server, not twenty-worker.
COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod 755 /app/entrypoint.sh

# ---- s6-overlay service definitions ----
#
# s6-rc service layout under /etc/s6-overlay/s6-rc.d/:
#   <name>/type             — "longrun" for persistent processes
#   <name>/run              — executable that exec's the process
#   <name>/dependencies.d/  — empty files naming dependencies
#
# Services are registered in the user bundle so s6-overlay starts them
# automatically when /init (PID 1) boots the container.

# Service 1: redis
# Bound to 127.0.0.1 only — not reachable from outside the container.
# No persistence: we only use Redis for BullMQ queues and cache.
RUN mkdir -p /etc/s6-overlay/s6-rc.d/redis
RUN printf 'longrun\n' > /etc/s6-overlay/s6-rc.d/redis/type
RUN printf '#!/bin/sh\nexec redis-server --save "" --appendonly no --loglevel notice --bind 127.0.0.1\n' \
    > /etc/s6-overlay/s6-rc.d/redis/run && chmod 755 /etc/s6-overlay/s6-rc.d/redis/run

# Service 2: twenty-server
# Depends on redis. Runs as UID 1000. Uses entrypoint.sh for DB init.
RUN mkdir -p /etc/s6-overlay/s6-rc.d/twenty-server \
             /etc/s6-overlay/s6-rc.d/twenty-server/dependencies.d
RUN touch /etc/s6-overlay/s6-rc.d/twenty-server/dependencies.d/redis
RUN printf 'longrun\n' > /etc/s6-overlay/s6-rc.d/twenty-server/type
RUN printf '#!/bin/sh\nexec s6-setuidgid 1000 /bin/sh -c "cd /app/packages/twenty-server && exec /app/entrypoint.sh node dist/main"\n' \
    > /etc/s6-overlay/s6-rc.d/twenty-server/run \
    && chmod 755 /etc/s6-overlay/s6-rc.d/twenty-server/run

# Service 3: twenty-worker
# Depends on redis and twenty-server (schema must exist before processing jobs).
# Runs as UID 1000. Overrides migration and cron flags at the process level
# so they cannot accidentally run migrations even if env vars are misconfigured.
RUN mkdir -p /etc/s6-overlay/s6-rc.d/twenty-worker \
             /etc/s6-overlay/s6-rc.d/twenty-worker/dependencies.d
RUN touch /etc/s6-overlay/s6-rc.d/twenty-worker/dependencies.d/redis
RUN touch /etc/s6-overlay/s6-rc.d/twenty-worker/dependencies.d/twenty-server
RUN printf 'longrun\n' > /etc/s6-overlay/s6-rc.d/twenty-worker/type
RUN printf '#!/bin/sh\nexec s6-setuidgid 1000 /bin/sh -c "cd /app/packages/twenty-server && DISABLE_DB_MIGRATIONS=true DISABLE_CRON_JOBS_REGISTRATION=true exec node dist/worker"\n' \
    > /etc/s6-overlay/s6-rc.d/twenty-worker/run \
    && chmod 755 /etc/s6-overlay/s6-rc.d/twenty-worker/run

# Register all three services in the s6 user bundle
RUN mkdir -p /etc/s6-overlay/s6-rc.d/user/contents.d \
    && touch \
        /etc/s6-overlay/s6-rc.d/user/contents.d/redis \
        /etc/s6-overlay/s6-rc.d/user/contents.d/twenty-server \
        /etc/s6-overlay/s6-rc.d/user/contents.d/twenty-worker

# ---- File storage directory ----
# Mounted as a Render persistent disk at this exact path.
RUN mkdir -p /app/packages/twenty-server/.local-storage \
    && chown 1000:1000 /app/packages/twenty-server/.local-storage

# ---- Environment variable defaults ----
#
# Variables marked REQUIRED must be set in Render's Environment panel.
# They are never baked into the image — they are injected at container start.
#
# REQUIRED:
#   PG_DATABASE_URL  — Render internal PostgreSQL connection string
#                      Must end in /default (Twenty requires this DB name)
#   APP_SECRET       — openssl rand -base64 32
#   ENCRYPTION_KEY   — openssl rand -base64 32  (separate from APP_SECRET)
#   SERVER_URL       — full public HTTPS URL, e.g. https://twenty.onrender.com
#                      (set after first deploy once you have the URL)
#
# Set automatically by this Dockerfile (override only if needed):
#   REDIS_URL        — points to the in-container Redis instance
#   NODE_ENV / NODE_PORT / STORAGE_TYPE / IS_CONFIG_VARIABLES_IN_DB_ENABLED
#
ENV NODE_ENV=production \
    NODE_PORT=3000 \
    REDIS_URL=redis://127.0.0.1:6379 \
    STORAGE_TYPE=local \
    IS_CONFIG_VARIABLES_IN_DB_ENABLED=true \
    DISABLE_DB_MIGRATIONS=false \
    DISABLE_CRON_JOBS_REGISTRATION=false \
    S6_KEEP_ENV=1

# S6_KEEP_ENV=1 propagates all container environment variables into every
# s6-supervised child process automatically. Render's env vars therefore
# reach twenty-server and twenty-worker with no extra configuration.

EXPOSE 3000

WORKDIR /app/packages/twenty-server

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="Twenty CRM — server + worker + Redis. Hardened runtime (DHI Alpine). External Postgres via PG_DATABASE_URL."
LABEL org.opencontainers.image.base.name=dhi.io/node:24-alpine3.23-dev

# s6-overlay is PID 1. It boots redis, then twenty-server, then twenty-worker,
# supervising all three for the lifetime of the container.
ENTRYPOINT ["/init"]
