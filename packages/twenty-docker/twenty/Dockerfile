# ===========================================================================
# Shared build stages (used by both targets)
# ===========================================================================

FROM node:24-alpine AS common-deps

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
COPY ./packages/twenty-front-component-renderer/package.json /app/packages/twenty-front-component-renderer/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY ./packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/

RUN yarn && yarn cache clean && npx nx reset


FROM common-deps AS twenty-server-build

COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk /app/packages/twenty-client-sdk
COPY ./packages/twenty-server /app/packages/twenty-server

RUN npx nx run twenty-server:lingui:extract && \
    npx nx run twenty-server:lingui:compile && \
    npx nx run twenty-emails:lingui:extract && \
    npx nx run twenty-emails:lingui:compile

RUN npx nx run twenty-server:build

# Clean server build output (type declarations and compiled tests are not needed at runtime;
# source maps are kept because twenty-infra extracts them from the image for Sentry uploads)
RUN find /app/packages/twenty-server/dist -name '*.d.ts' -delete \
 && rm -rf /app/packages/twenty-server/dist/packages/twenty-server/test

RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-sdk twenty-client-sdk twenty-server


FROM common-deps AS twenty-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-front-component-renderer /app/packages/twenty-front-component-renderer
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk /app/packages/twenty-client-sdk
RUN npx nx run twenty-front:lingui:extract && \
    npx nx run twenty-front:lingui:compile
# To skip the memory-intensive frontend build, pre-build on the host:
#   npx nx build twenty-front
# The check below will use packages/twenty-front/build/ if it already exists.
RUN if [ -d /app/packages/twenty-front/build ]; then \
      echo "Using pre-built frontend from host"; \
    else \
      NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front; \
    fi


# ===========================================================================
# Target: twenty (production)
#   docker build --target twenty -f packages/twenty-docker/twenty/Dockerfile .
# ===========================================================================

FROM node:24-alpine AS twenty

RUN apk add --no-cache curl jq postgresql-client

COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/packages/twenty-server

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

# Workspace root config
COPY --chown=1000 --from=twenty-server-build /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/
COPY --chown=1000 --from=twenty-server-build /app/tsconfig.base.json /app/nx.json /app/
COPY --chown=1000 --from=twenty-server-build /app/.yarn /app/.yarn
COPY --chown=1000 --from=twenty-server-build /app/node_modules /app/node_modules

# Server package (compiled dist + package.json only, no src/)
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/package.json /app/packages/twenty-server/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/dist /app/packages/twenty-server/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/patches /app/packages/twenty-server/patches

# Workspace packages (dist + package.json; node_modules symlinks resolve to these)
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-shared/dist /app/packages/twenty-shared/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-emails/dist /app/packages/twenty-emails/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-client-sdk/dist /app/packages/twenty-client-sdk/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-front/package.json /app/packages/twenty-front/

# Frontend static build
COPY --chown=1000 --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="Production Twenty image with backend and frontend."

RUN mkdir -p /app/.local-storage /app/packages/twenty-server/.local-storage && \
    chown 1000:1000 /app/.local-storage /app/packages/twenty-server/.local-storage

USER 1000

CMD ["node", "dist/main"]
ENTRYPOINT ["/app/entrypoint.sh"]


# ===========================================================================
# Target: twenty-app-dev (all-in-one with Postgres + Redis)
#   docker build --target twenty-app-dev -f packages/twenty-docker/twenty/Dockerfile .
# ===========================================================================

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

FROM node:24-alpine AS twenty-app-dev

# s6-overlay
COPY --from=s6-fetch /tmp/s6-overlay-noarch.tar.xz /tmp/
COPY --from=s6-fetch /tmp/s6-overlay-arch.tar.xz /tmp/
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz \
 && tar -C / -Jxpf /tmp/s6-overlay-arch.tar.xz \
 && rm /tmp/s6-overlay-*.tar.xz

RUN apk add --no-cache \
    postgresql16 postgresql16-contrib \
    redis \
    curl jq su-exec

# Workspace root config
COPY --from=twenty-server-build /app/package.json /app/yarn.lock /app/.yarnrc.yml /app/
COPY --from=twenty-server-build /app/tsconfig.base.json /app/nx.json /app/
COPY --from=twenty-server-build /app/.yarn /app/.yarn
COPY --from=twenty-server-build /app/node_modules /app/node_modules

# Server package (compiled dist + package.json only, no src/)
COPY --from=twenty-server-build /app/packages/twenty-server/package.json /app/packages/twenty-server/
COPY --from=twenty-server-build /app/packages/twenty-server/dist /app/packages/twenty-server/dist
COPY --from=twenty-server-build /app/packages/twenty-server/patches /app/packages/twenty-server/patches

# Workspace packages (dist + package.json; node_modules symlinks resolve to these)
COPY --from=twenty-server-build /app/packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY --from=twenty-server-build /app/packages/twenty-shared/dist /app/packages/twenty-shared/dist
COPY --from=twenty-server-build /app/packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY --from=twenty-server-build /app/packages/twenty-emails/dist /app/packages/twenty-emails/dist
COPY --from=twenty-server-build /app/packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY --from=twenty-server-build /app/packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/
COPY --from=twenty-server-build /app/packages/twenty-client-sdk/dist /app/packages/twenty-client-sdk/dist
COPY --from=twenty-server-build /app/packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY --from=twenty-server-build /app/packages/twenty-front/package.json /app/packages/twenty-front/

# Frontend static build
COPY --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# Source maps are not needed in the dev image (no Sentry)
RUN find /app/packages/twenty-server/dist -name '*.js.map' -delete

# s6 service definitions
COPY packages/twenty-docker/twenty-app-dev/rootfs/ /

RUN mkdir -p /data/postgres /data/redis /app/packages/twenty-server/.local-storage \
 && chown -R postgres:postgres /data/postgres \
 && chown 1000:1000 /data/redis /app/packages/twenty-server/.local-storage

ARG REACT_APP_SERVER_BASE_URL
ARG APP_VERSION=0.0.0

ENV S6_KEEP_ENV=1
ENV PG_DATABASE_URL=postgres://twenty:twenty@localhost:5432/default \
    SERVER_URL=http://localhost:2020 \
    REDIS_URL=redis://localhost:6379 \
    STORAGE_TYPE=local \
    APP_SECRET=twenty-app-dev-secret-not-for-production \
    REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL \
    APP_VERSION=$APP_VERSION \
    NODE_ENV=development \
    NODE_PORT=2020 \
    DISABLE_DB_MIGRATIONS=true \
    DISABLE_CRON_JOBS_REGISTRATION=true \
    IS_BILLING_ENABLED=false \
    SIGN_IN_PREFILLED=true \
    APPLICATION_LOG_DRIVER=CONSOLE

EXPOSE 2020
VOLUME ["/data/postgres", "/app/packages/twenty-server/.local-storage"]

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="All-in-one Twenty image for local development and SDK usage. Includes PostgreSQL, Redis, server, and worker."

ENTRYPOINT ["/init"]
