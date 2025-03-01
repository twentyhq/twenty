# Base image for common dependencies
FROM node:18.17.1-alpine as common-deps

WORKDIR /app

# Increase file watcher limits (note these won't persist in container runtime)
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

# ------------------------------
# Build the back
# ------------------------------
FROM common-deps as twenty-server-build

# Copy source code after dependency installation to accelerate subsequent builds
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

# Install only production dependencies for specific workspaces
RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-server

# Clean up any temporary empty directories
RUN find /app -type d -name "node_modules" -prune -o -type d -name ".nx" -prune -o -type d -name "dist" -prune -o -type d -empty -delete || true

# ------------------------------
# Build the front
# ------------------------------
FROM common-deps as twenty-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared

# Build frontend with production settings
RUN npx nx build twenty-front

# Clean up temporary empty directories
RUN find /app -type d -name "node_modules" -prune -o -type d -name ".nx" -prune -o -type d -name "build" -prune -o -type d -empty -delete || true

# ------------------------------
# Final stage: Run the application
# ------------------------------
FROM node:18.17.1-alpine as twenty

# Install utilities for healthchecks and other runtime needs
RUN apk add --no-cache curl jq postgresql-client

# Install global packages if needed
RUN npm install -g tsx

WORKDIR /app

# Copy the entrypoint script and set executable permissions
COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL $REACT_APP_SERVER_BASE_URL
ARG SENTRY_RELEASE
ENV SENTRY_RELEASE $SENTRY_RELEASE
ENV NODE_ENV=production

# Create directory for frontend files inside the backend package
RUN mkdir -p /app/packages/twenty-server/dist/front

# Copy production node_modules from the build stage so that runtime dependencies are present
COPY --chown=1000 --from=twenty-server-build /app/node_modules /app/node_modules

# Copy the built backend application and other required files
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/dist /app/packages/twenty-server/dist
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-emails /app/packages/twenty-emails
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-shared /app/packages/twenty-shared
COPY --chown=1000 --from=twenty-server-build /app/packages/twenty-server/package.json /app/packages/twenty-server/
# Copy the built frontend into the backend’s dist folder
COPY --chown=1000 --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# Set metadata labels
LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend and frontend."

# Create local storage directory and adjust ownership
RUN mkdir -p /app/.local-storage
RUN chown -R 1000 /app

# Use non-root user with uid 1000
USER 1000

WORKDIR /app/packages/twenty-server
CMD ["node", "dist/src/main"]
ENTRYPOINT ["/app/entrypoint.sh"]