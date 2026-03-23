ARG APP_VERSION

# === Stage 1: Common dependencies ===
FROM node:22-alpine AS common-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/

RUN yarn && yarn cache clean && npx nx reset

# === Stage 2: Build server from source ===
FROM common-deps AS twenty-server-build

COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-server /app/packages/twenty-server

RUN npx nx run twenty-server:build
RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-sdk twenty-server

# === Stage 3: Build frontend from source ===
# Requires ~10GB Docker memory. To skip, pre-build on host first:
#   npx nx build twenty-front
# The COPY below will pick up packages/twenty-front/build/ if it exists.
FROM common-deps AS twenty-front-build
COPY --from=twenty-server-build /app/package.json /tmp/.build-sentinel

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
RUN if [ -d /app/packages/twenty-front/build ]; then \
      echo "Using pre-built frontend from host"; \
    else \
      NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front; \
    fi

# === Stage 4: s6-overlay ===
FROM alpine:3.20 AS s6-fetch
ARG S6_OVERLAY_VERSION=3.2.0.2
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "arm64" ]; then echo "aarch64" > /tmp/s6arch; \
    else echo "x86_64" > /tmp/s6arch; fi
RUN S6_ARCH=$(cat /tmp/s6arch) && \
    wget -O /tmp/s6-overlay-noarch.tar.xz \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz" && \
    wget -O /tmp/s6-overlay-noarch.tar.xz.sha256 \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz.sha256" && \
    wget -O /tmp/s6-overlay-arch.tar.xz \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${S6_ARCH}.tar.xz" && \
    wget -O /tmp/s6-overlay-arch.tar.xz.sha256 \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${S6_ARCH}.tar.xz.sha256" && \
    cd /tmp && \
    NOARCH_SUM=$(awk '{print $1}' s6-overlay-noarch.tar.xz.sha256) && \
    ARCH_SUM=$(awk '{print $1}' s6-overlay-arch.tar.xz.sha256) && \
    echo "$NOARCH_SUM  s6-overlay-noarch.tar.xz" | sha256sum -c - && \
    echo "$ARCH_SUM  s6-overlay-arch.tar.xz" | sha256sum -c -

# === Stage 5: Final all-in-one image ===
FROM node:22-alpine

# s6-overlay
COPY --from=s6-fetch /tmp/s6-overlay-noarch.tar.xz /tmp/
COPY --from=s6-fetch /tmp/s6-overlay-arch.tar.xz /tmp/
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz \
 && tar -C / -Jxpf /tmp/s6-overlay-arch.tar.xz \
 && rm /tmp/s6-overlay-*.tar.xz

# Infrastructure: Postgres, Redis, and utilities
RUN apk add --no-cache \
    postgresql16 postgresql16-contrib \
    redis \
    curl jq su-exec

# tsx for database setup scripts
RUN npm install -g tsx

# Twenty application (both server and frontend built from source)
COPY --from=twenty-server-build /app /app
COPY --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# s6 service definitions
COPY packages/twenty-docker/twenty-app-dev/rootfs/ /

# Data directories
RUN mkdir -p /data/postgres /data/redis /app/.local-storage \
 && chown -R postgres:postgres /data/postgres \
 && chown 1000:1000 /data/redis /app/.local-storage

ARG REACT_APP_SERVER_BASE_URL
ARG APP_VERSION=0.0.0

# Tell s6-overlay to preserve container environment variables
ENV S6_KEEP_ENV=1

# Environment defaults
ENV PG_DATABASE_URL=postgres://twenty:twenty@localhost:5432/default \
    SERVER_URL=http://localhost:2020 \
    REDIS_URL=redis://localhost:6379 \
    STORAGE_TYPE=local \
    APP_SECRET=twenty-app-dev-secret-not-for-production \
    REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL \
    APP_VERSION=$APP_VERSION \
    NODE_ENV=development \
    NODE_PORT=3000 \
    DISABLE_DB_MIGRATIONS=true \
    DISABLE_CRON_JOBS_REGISTRATION=true \
    IS_BILLING_ENABLED=false \
    SIGN_IN_PREFILLED=true

EXPOSE 3000
VOLUME ["/data/postgres", "/app/.local-storage"]

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="All-in-one Twenty image for local development and SDK usage. Includes PostgreSQL, Redis, server, and worker."

ENTRYPOINT ["/init"]
