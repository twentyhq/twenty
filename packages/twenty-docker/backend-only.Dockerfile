# Backend-only build (lighter memory footprint)
FROM node:24-alpine AS common-deps

WORKDIR /app

# Copy dependency files
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches
COPY ./.prettierrc /app/
COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/

# Install dependencies
RUN yarn && yarn cache clean && npx nx reset

# Build the backend
FROM common-deps AS twenty-server-build

COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-server /app/packages/twenty-server

# Disable Nx daemon to avoid issues in Docker
ENV NX_DAEMON=false

RUN npx nx run twenty-server:build
RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-server

# Final stage
FROM node:24-alpine

RUN apk add --no-cache curl jq postgresql-client
RUN npm install -g tsx

COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/packages/twenty-server

# Copy built backend
COPY --chown=1000 --from=twenty-server-build /app /app
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server /app/packages/twenty-server

# Create storage directories
RUN mkdir -p /app/.local-storage /app/packages/twenty-server/.local-storage && \
    chown -R 1000:1000 /app

USER 1000

CMD ["node", "dist/main"]
ENTRYPOINT ["/app/entrypoint.sh"]
