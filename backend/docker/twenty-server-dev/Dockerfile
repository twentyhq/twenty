# Backend dev Dockerfile (unchanged from working version)
FROM node:20-alpine

RUN apk add --no-cache curl git postgresql-client

WORKDIR /app

# Copy monorepo root config for dependency installation.
# Source code is volume-mounted at runtime — only package.jsons are needed here.
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn ./.yarn

COPY backend/twenty-server/package.json                       packages/twenty-server/
COPY backend/twenty-server/patches                            packages/twenty-server/patches
COPY packages/twenty-emails/package.json                      packages/twenty-emails/
COPY packages/twenty-shared/package.json                      packages/twenty-shared/
COPY packages/twenty-sdk/package.json                         packages/twenty-sdk/
COPY packages/twenty-client-sdk/package.json                  packages/twenty-client-sdk/
COPY packages/twenty-ui/package.json                          packages/twenty-ui/
COPY frontend/twenty-front/package.json                       packages/twenty-front/
COPY packages/twenty-front-component-renderer/package.json    packages/twenty-front-component-renderer/

# Pre-install all deps as a cached layer.
# Rebuild this image only when package.json or yarn.lock changes.
RUN yarn install --immutable && yarn cache clean

EXPOSE 3000

ENV NODE_ENV=development \
    NX_DAEMON=false

# This image is shared by the backend and worker services.
# The worker overrides CMD in docker-compose.yml.
CMD ["npx", "nx", "start", "twenty-server"]
