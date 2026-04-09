# syntax=docker/dockerfile:1
FROM node:24-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copy root monorepo config
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn ./.yarn

# Copy only required workspace package.jsons
COPY packages/twenty-front/package.json packages/twenty-front/
COPY packages/twenty-front-component-renderer/package.json packages/twenty-front-component-renderer/
COPY packages/twenty-ui/package.json packages/twenty-ui/
COPY packages/twenty-shared/package.json packages/twenty-shared/
COPY packages/twenty-sdk/package.json packages/twenty-sdk/
COPY packages/twenty-client-sdk/package.json packages/twenty-client-sdk/
COPY packages/twenty-emails/package.json packages/twenty-emails/
COPY packages/twenty-server/package.json packages/twenty-server/

# Install dependencies (cached layer)
RUN yarn install --immutable && yarn cache clean

# Copy source code
COPY packages/twenty-front packages/twenty-front
COPY packages/twenty-front-component-renderer packages/twenty-front-component-renderer
COPY packages/twenty-ui packages/twenty-ui
COPY packages/twenty-shared packages/twenty-shared
COPY packages/twenty-sdk packages/twenty-sdk
COPY packages/twenty-client-sdk packages/twenty-client-sdk
COPY packages/twenty-emails packages/twenty-emails
COPY packages/twenty-server packages/twenty-server

EXPOSE 3001

ENV NODE_ENV=development \
    NX_DAEMON=false

CMD ["npx", "nx", "start", "twenty-front"]
