FROM node:24-alpine AS common-deps

WORKDIR /app

COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./frontend/twenty-front/package.json /app/packages/twenty-front/
COPY ./packages/twenty-front-component-renderer/package.json /app/packages/twenty-front-component-renderer/
COPY ./packages/twenty-sdk/package.json /app/packages/twenty-sdk/
COPY ./packages/twenty-client-sdk/package.json /app/packages/twenty-client-sdk/

RUN yarn && yarn cache clean && npx nx reset

FROM common-deps AS frontend-build

ARG REACT_APP_SERVER_BASE_URL=http://localhost:8080
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-ui /app/packages/twenty-ui
COPY ./packages/twenty-sdk /app/packages/twenty-sdk
COPY ./packages/twenty-client-sdk /app/packages/twenty-client-sdk
COPY ./packages/twenty-front-component-renderer /app/packages/twenty-front-component-renderer
COPY ./frontend/twenty-front /app/packages/twenty-front

RUN npx nx run twenty-front:lingui:extract && \
    npx nx run twenty-front:lingui:compile && \
    NODE_OPTIONS="--max-old-space-size=8192" npx nx build twenty-front

FROM nginx:1.27-alpine

COPY ./packages/twenty-docker/podman/nginx-front.conf /etc/nginx/conf.d/default.conf
COPY ./packages/twenty-docker/podman/frontend-entrypoint.sh /entrypoint.sh
COPY --from=frontend-build /app/packages/twenty-front/build /usr/share/nginx/html

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
