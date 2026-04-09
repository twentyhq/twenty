# Frontend dev Dockerfile (unchanged from working version)
FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copy monorepo root config for dependency installation.
# Source code is volume-mounted at runtime — only package.jsons are needed here.
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn ./.yarn

COPY frontend/twenty-front/package.json                       packages/twenty-front/
COPY packages/twenty-front-component-renderer/package.json    packages/twenty-front-component-renderer/
COPY packages/twenty-ui/package.json                          packages/twenty-ui/
COPY packages/twenty-shared/package.json                      packages/twenty-shared/
COPY packages/twenty-sdk/package.json                         packages/twenty-sdk/
COPY packages/twenty-client-sdk/package.json                  packages/twenty-client-sdk/
COPY packages/twenty-emails/package.json                      packages/twenty-emails/
COPY backend/twenty-server/package.json                       packages/twenty-server/

# Pre-install all deps as a cached layer.
RUN yarn install --immutable && yarn cache clean

EXPOSE 3001

ENV NODE_ENV=development \
    NX_DAEMON=false

CMD ["npx", "nx", "start", "twenty-front"]
