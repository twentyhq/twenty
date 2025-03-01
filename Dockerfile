# Base image for common dependencies
FROM node:18.17.1-alpine as common-deps

WORKDIR /app

# Increase file watcher limits (but note these won't persist in container runtime)
RUN echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf && \
    echo fs.inotify.max_user_instances=512 | tee -a /etc/sysctl.conf

# Setup build environment
ENV NODE_OPTIONS="--max-old-space-size=4096 --no-warnings"
ENV NODE_ENV=production
ENV CHOKIDAR_USEPOLLING=1
ENV WATCHPACK_POLLING=true

# Copy only the necessary files for dependency resolution
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases

COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/

# Install all dependencies
RUN yarn && yarn cache clean && npx nx reset


# Build the back
FROM common-deps as twenty-server-build

# Copy sourcecode after installing dependences to accelerate subsequents builds
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-server /app/packages/twenty-server

# Build with production settings
RUN npx nx run twenty-server:build
RUN mv /app/packages/twenty-server/dist /app/packages/twenty-server/build
RUN npx nx run twenty-server:build:packageJson
RUN mv /app/packages/twenty-server/dist/package.json /app/packages/twenty-server/package.json
RUN rm -rf /app/packages/twenty-server/dist
RUN mv /app/packages/twenty-server/build /app/packages/twenty-server/dist

# Build the front
FROM common-deps as twenty-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared

# Build with production settings
RUN npx nx build twenty-front


# Final stage: Run the application
FROM node:18.17.1-alpine as twenty

# Used to run healthcheck in docker
RUN apk add --no-cache curl jq postgresql-client

RUN npm install -g tsx

WORKDIR /app

COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL $REACT_APP_SERVER_BASE_URL
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE $SENTRY_RELEASE
# Ensure we're in production mode
ENV NODE_ENV=production

# Create a dedicated directory for the server and frontend
RUN mkdir -p /app/packages/twenty-server/dist/front

# Copy package.json files needed for dependencies
COPY --chown=1000 ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY --chown=1000 ./.yarn/releases /app/.yarn/releases

COPY --chown=1000 ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY --chown=1000 ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY --chown=1000 ./packages/twenty-shared/package.json /app/packages/twenty-shared/

# Copy built applications from previous stages
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/dist /app/packages/twenty-server/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-emails /app/packages/twenty-emails
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-shared /app/packages/twenty-shared
COPY --chown=1000 --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# Install only production dependencies in the final image
WORKDIR /app
RUN yarn workspaces focus --production twenty-server twenty-emails twenty-shared

# Set metadata and labels
LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend and frontend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

# Create and set permissions for local storage
RUN mkdir -p /app/.local-storage
RUN chown -R 1000 /app

# Use non root user with uid 1000
USER 1000

WORKDIR /app/packages/twenty-server
CMD ["node", "dist/src/main"]
ENTRYPOINT ["/app/entrypoint.sh"]