# Base image for common dependencies
FROM node:24-alpine AS common-deps

# Memory optimization for CI/CD environments
# Disable Nx daemon to save 500MB-1GB memory (minimal time impact in Docker builds)
ARG NX_DAEMON=false
# Reduce Node.js heap size to prevent OOM on memory-constrained agents
# Can be overridden: --build-arg NODE_OPTIONS="--max-old-space-size=2048"
ARG NODE_OPTIONS="--max-old-space-size=1792"

ENV NX_DAEMON=${NX_DAEMON}
ENV NODE_OPTIONS=${NODE_OPTIONS}

WORKDIR /app

# Copy only the necessary files for dependency resolution
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

# Install all dependencies
RUN yarn && yarn cache clean && npx nx reset


# Build the back
FROM common-deps AS twenty-server-build

# Inherit memory optimization settings
ARG NX_DAEMON=false
ARG NODE_OPTIONS="--max-old-space-size=1792"

ENV NX_DAEMON=${NX_DAEMON}
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Copy sourcecode after installing dependences to accelerate subsequents builds
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-server /app/packages/twenty-server

RUN npx nx run twenty-server:build

RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-server

# Build the front
FROM twenty-server-build AS twenty-front-build

# Inherit memory optimization settings
ARG NX_DAEMON=false
ARG NODE_OPTIONS="--max-old-space-size=1792"
ARG REACT_APP_SERVER_BASE_URL

ENV NX_DAEMON=${NX_DAEMON}
ENV NODE_OPTIONS=${NODE_OPTIONS}

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
RUN npx nx build twenty-front


# Final stage: Run the application
FROM node:24-alpine AS twenty

# Used to run healthcheck in docker
RUN apk add --no-cache curl jq

RUN npm install -g tsx

RUN apk add --no-cache postgresql-client

COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
WORKDIR /app/packages/twenty-server

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

# Copy built applications from previous stages
COPY --chown=1000 --from=twenty-server-build /app /app
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server /app/packages/twenty-server
COPY --chown=1000 --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# Set metadata and labels
LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend and frontend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

RUN mkdir -p /app/.local-storage /app/packages/twenty-server/.local-storage && \
    chown -R 1000:1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["node", "dist/main"]
ENTRYPOINT ["/app/entrypoint.sh"]
