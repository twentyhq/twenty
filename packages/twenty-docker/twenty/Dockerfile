# Base image for common dependencies
FROM node:24-alpine AS common-deps

WORKDIR /app

# Copy only the necessary files for dependency resolution
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/

# Install all dependencies
RUN yarn && yarn cache clean && npx nx reset


# Build the back
FROM common-deps AS twenty-server-build

# Copy sourcecode after installing dependences to accelerate subsequents builds
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-server /app/packages/twenty-server

# The --mount=type=cache directive persists .nx/cache between Railway builds on
# the same machine (outside the image layer system, so it survives across builds).
# Nx tracks build inputs: if none changed since the last build, it reuses the
# cached output instead of recompiling. Both stages share the same cache ID so
# they benefit from each other's outputs:
#   - backend-only change  → frontend build hits Nx cache (~seconds, not ~2.5 min)
#   - frontend-only change → backend build hits Nx cache (~seconds, not ~41s)
# sharing=locked prevents corruption if both stages access the cache simultaneously.
# If the cache is empty (first build, or evicted by Railway) it falls back to a
# full build transparently.
# Railway requires cache mount IDs in the format s/<service-id>-<descriptor>.
# Environment variables cannot be used in cache mount IDs (Railway limitation).
# Service ID: 29a802aa-b44b-4b37-b13e-fe10da3ab6dc (the "twenty" Railway service).
RUN --mount=type=cache,id=s/29a802aa-b44b-4b37-b13e-fe10da3ab6dc-nx-cache,sharing=locked,target=/app/.nx/cache \
    npx nx run twenty-server:build

RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-sdk twenty-server

# Build the front
FROM common-deps AS twenty-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
# See comment above twenty-server:build for full explanation of this cache mount.
RUN --mount=type=cache,id=s/29a802aa-b44b-4b37-b13e-fe10da3ab6dc-nx-cache,sharing=locked,target=/app/.nx/cache \
    npx nx build twenty-front


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
