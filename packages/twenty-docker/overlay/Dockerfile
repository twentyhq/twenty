# Overlay twentycrm/twenty:v2.31.1 with the fork frontend (RELATIONS view)
# and a rebuilt twenty-shared dist (ViewType.RELATIONS). Server stays the
# published v2.31.1 binary. Deploy from the Twenty repo root:
#   fly deploy . -c packages/twenty-docker/overlay/fly.toml
#
# SOURCING: packages/twenty-docker/twenty/Dockerfile front-deps + twenty-front-build

FROM node:24.18.0-alpine3.23@sha256:595398b0081eacda8e1c4c5b97b76cd1020e4d58a8ebcb4843b9bca1e79e7436 AS front-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/
COPY ./packages/twenty-front-component-renderer/package.json /app/packages/twenty-front-component-renderer/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY ./packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/

ENV NX_DAEMON=false
RUN yarn workspaces focus twenty twenty-front twenty-front-component-renderer twenty-ui twenty-shared twenty-sdk twenty-client-sdk && yarn cache clean && npx nx reset

FROM front-deps AS twenty-front-build

COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-front-component-renderer /app/packages/twenty-front-component-renderer
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk /app/packages/twenty-client-sdk

ENV NX_DAEMON=false
ENV NX_PARALLEL=1
RUN npx nx run twenty-front:lingui:extract && \
    npx nx run twenty-front:lingui:compile
ENV CI=true
RUN NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front
RUN test -f /app/packages/twenty-front/build/index.html
RUN grep -R -q "RELATIONS" /app/packages/twenty-shared/dist

FROM twentycrm/twenty:v2.31.1

USER root
COPY --from=twenty-front-build --chown=1000:1000 /app/packages/twenty-front/build /app/packages/twenty-server/dist/front
COPY --from=twenty-front-build --chown=1000:1000 /app/packages/twenty-shared/dist /app/packages/twenty-shared/dist
COPY packages/twenty-docker/overlay/add-relations-view-type.sh /app/add-relations-view-type.sh
RUN chmod 0755 /app/add-relations-view-type.sh && \
    grep -R -q "RELATIONS" /app/packages/twenty-shared/dist && \
    test -f /app/packages/twenty-server/dist/front/index.html
USER 1000
