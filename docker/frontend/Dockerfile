FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /app

# Copy root monorepo config
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn ./.yarn

# Copy all packages — source files are excluded by .dockerignore (only package.json needed here)
# Using directory COPY avoids Windows BuildKit cache-key bugs with individual file paths
COPY packages/ packages/

# Pre-install all deps as a cached layer.
# Rebuild this image only when package.json or yarn.lock changes.
RUN yarn install && yarn cache clean

EXPOSE 3001

ENV NODE_ENV=development \
    NX_DAEMON=false

CMD ["npx", "nx", "start", "twenty-front"]
