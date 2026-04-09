# syntax=docker/dockerfile:1
FROM node:24-alpine

RUN apk add --no-cache curl git postgresql-client dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy root config
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn ./.yarn

# Copy workspace packages only (minimal context)
COPY packages/twenty-emails/package.json packages/twenty-emails/
COPY packages/twenty-shared/package.json packages/twenty-shared/
COPY packages/twenty-sdk/package.json packages/twenty-sdk/
COPY packages/twenty-client-sdk/package.json packages/twenty-client-sdk/
COPY packages/twenty-ui/package.json packages/twenty-ui/
COPY packages/twenty-front-component-renderer/package.json packages/twenty-front-component-renderer/

# Server workspace (in packages, not backend/)
RUN mkdir -p packages/twenty-server && echo '{}' > packages/twenty-server/package.json

# Install deps
RUN yarn install --immutable --ignore-scripts && yarn cache clean

EXPOSE 3000

ENV NODE_ENV=development \
    NX_DAEMON=false

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/healthz || exit 1

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["npx", "nx", "start", "twenty-server"]
