# === Stage 1: Reuse existing Twenty build ===
FROM twentycrm/twenty:latest AS twenty-app

# === Stage 2: s6-overlay ===
FROM alpine:3.20 AS s6-fetch
ARG S6_OVERLAY_VERSION=3.2.0.2
ARG TARGETARCH
# Map Docker arch names to s6-overlay arch names (amd64->x86_64, arm64->aarch64)
RUN if [ "$TARGETARCH" = "arm64" ]; then echo "aarch64" > /tmp/s6arch; \
    else echo "x86_64" > /tmp/s6arch; fi
RUN S6_ARCH=$(cat /tmp/s6arch) && \
    wget -O /tmp/s6-overlay-noarch.tar.xz \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz" && \
    wget -O /tmp/s6-overlay-arch.tar.xz \
      "https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-${S6_ARCH}.tar.xz"

# === Stage 3: Final image ===
FROM node:24-alpine

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

# Twenty application (reuse the existing production build)
COPY --from=twenty-app /app /app

# s6 service definitions
COPY rootfs/ /

# Data directories (only chown new dirs — /app is already owned by 1000 from the source image)
RUN mkdir -p /data/postgres /data/redis /app/.local-storage \
 && chown -R postgres:postgres /data/postgres \
 && chown 1000:1000 /data/redis /app/.local-storage

# Tell s6-overlay to preserve container environment variables
ENV S6_KEEP_ENV=1

# Environment defaults
ENV PG_DATABASE_URL=postgres://twenty:twenty@localhost:5432/default \
    SERVER_URL=http://localhost:2020 \
    REDIS_URL=redis://localhost:6379 \
    STORAGE_TYPE=local \
    APP_SECRET=change-me-in-production \
    NODE_PORT=3000 \
    DISABLE_DB_MIGRATIONS=true \
    DISABLE_CRON_JOBS_REGISTRATION=true

EXPOSE 3000
VOLUME ["/data/postgres", "/app/.local-storage"]

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="All-in-one Twenty image for local development and SDK usage. Includes PostgreSQL, Redis, server, and worker."

ENTRYPOINT ["/init"]
