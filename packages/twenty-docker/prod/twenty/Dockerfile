# Build the front-end
FROM node:18.17.1-alpine as twenty-front-build

ARG REACT_APP_SERVER_BASE_URL
ARG REACT_APP_SERVER_AUTH_URL
ARG REACT_APP_SERVER_FILES_URL

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./tools/eslint-rules /app/tools/eslint-rules
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/package.json

RUN yarn

COPY ./packages/twenty-front /app/packages/twenty-front
RUN yarn nx build twenty-front

# Build the back-end
FROM node:18.16.0-alpine as twenty-server-build

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./tsconfig.base.json .
COPY ./nx.json .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-server /app/packages/twenty-server
RUN yarn workspaces focus twenty-emails twenty-server
RUN npx nx reset
RUN npx nx run twenty-server:build:packageJson
RUN mv /app/packages/twenty-server/dist/package.json /app/packages/twenty-server/package.json
RUN yarn workspaces focus twenty-emails twenty-server
RUN npx nx run twenty-server:build

FROM node:18.16.0-alpine

WORKDIR /app

COPY --from=twenty-server-build /app/packages/twenty-server /app/packages/twenty-server
COPY --from=twenty-server-build /app/packages/twenty-emails /app/packages/twenty-emails
COPY --from=twenty-server-build /app/node_modules /app/node_modules
COPY --from=twenty-front-build /app/packages/twenty-front/build /app/packages/twenty-server/dist/twenty-front

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the full stack application, ensuring it deploys faster and runs the same way regardless of the deployment environment."

CMD ["node", "packages/twenty-server/dist/src/main"]
