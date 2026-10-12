# Builds Twenty for Anthropic's OSS Scanner (https://github.com/anthropics/oss-scanner).
# Mirrors .github/workflows/ci-server.yaml: Yarn 4 install, twenty-shared/twenty-emails/twenty-server builds,
# then a local Postgres + Redis initialized and seeded so the server and integration tests run offline.
FROM node:24-bookworm
ENV DEBIAN_FRONTEND=noninteractive \
    CI=true \
    NX_NO_CLOUD=true \
    NX_DAEMON=false \
    NX_TUI=false \
    YARN_ENABLE_TELEMETRY=0 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg lsb-release git python3 build-essential redis-server \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update && apt-get install -y --no-install-recommends postgresql-18 \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# scanner contract: the checkout lives inside the image, at /src
COPY . /src
WORKDIR /src

RUN yarn install --immutable

RUN npx nx build twenty-shared \
    && npx nx build twenty-emails \
    && npx nx build twenty-server

# Same credentials as packages/twenty-server/.env.test and the CI service containers.
RUN service postgresql start \
    && su postgres -c "psql -c \"ALTER USER postgres PASSWORD 'postgres';\"" \
    && su postgres -c "psql -c 'CREATE DATABASE \"default\";'" \
    && su postgres -c "psql -c 'CREATE DATABASE \"test\";'" \
    && service postgresql stop

# Seeds the dev database (packages/twenty-server/.env, port 3000) with demo workspaces and users. Failures are
# logged, not fatal: the scanner can still read and unit-test the code without a seeded database.
RUN npx nx reset:env twenty-server \
    && service postgresql start && service redis-server start \
    && (npx nx database:reset twenty-server || echo "WARNING: database:reset failed") \
    && service redis-server stop && service postgresql stop

# Cheap smoke test. Full suites: `npx nx test twenty-server`, `npx nx test twenty-front`, and
# `npx nx run twenty-server:test:integration:with-db-reset` (needs `service postgresql start && service redis-server start`).
RUN npx nx test twenty-shared || echo "WARNING: twenty-shared tests reported failures"
