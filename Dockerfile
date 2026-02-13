# Railway build was auto-detecting a Railpack plan that attempted to run
# `yarn workspace twenty-server start:prod` during the *build* phase, which
# fails when `packages/twenty-server/dist/main` hasn't been built yet.
#
# This Dockerfile forces an explicit build (nx build) and a clean start command.

FROM node:24.5.0-bookworm-slim AS build

WORKDIR /app

# Unblock installs even if Yarn would otherwise try to enforce lockfile immutability in CI.
ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false

RUN corepack enable \
  && corepack prepare yarn@4.9.2 --activate

# Copy only dependency manifests first for better layer caching.
COPY package.json yarn.lock .yarnrc.yml .nvmrc ./
COPY .yarn/ .yarn/

# Workspace manifests
COPY packages/create-twenty-app/package.json packages/create-twenty-app/package.json
COPY packages/twenty-cli/package.json packages/twenty-cli/package.json
COPY packages/twenty-e2e-testing/package.json packages/twenty-e2e-testing/package.json
COPY packages/twenty-emails/package.json packages/twenty-emails/package.json
COPY packages/twenty-sdk/package.json packages/twenty-sdk/package.json
COPY packages/twenty-server/package.json packages/twenty-server/package.json
# Yarn patch files referenced by dependencies
COPY packages/twenty-server/patches/ packages/twenty-server/patches/
COPY packages/twenty-shared/package.json packages/twenty-shared/package.json
COPY packages/twenty-ui/package.json packages/twenty-ui/package.json
COPY packages/twenty-utils/package.json packages/twenty-utils/package.json
COPY packages/twenty-zapier/package.json packages/twenty-zapier/package.json

RUN yarn install

# Now copy the rest of the repo and build just the server.
COPY . .

RUN cd packages/twenty-server \
  && rm -rf dist \
  && ../../node_modules/.bin/nest build --path ./tsconfig.build.json

FROM node:24.5.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable \
  && corepack prepare yarn@4.9.2 --activate

# Only copy the server package runtime + its built output + root node_modules.
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/packages/twenty-server /app/packages/twenty-server

EXPOSE 3000

# Run the built server directly. Railway may have a service Start Command set to yarn,
# which would override Docker CMD; using an ENTRYPOINT here makes startup deterministic.
ENTRYPOINT ["sh", "-lc", "node packages/twenty-server/dist/main.js"]
