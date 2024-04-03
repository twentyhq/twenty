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
RUN yarn

RUN npx nx reset
RUN npx nx run twenty-server:build
RUN mv /app/packages/twenty-server/dist /app/packages/twenty-server/build
RUN npx nx run twenty-server:build:packageJson
RUN mv /app/packages/twenty-server/dist/package.json /app/packages/twenty-server/package.json
RUN rm -rf /app/packages/twenty-server/dist
RUN mv /app/packages/twenty-server/build /app/packages/twenty-server/dist

WORKDIR /app
RUN yarn workspaces focus --production twenty-emails twenty-server

FROM node:18.17.1-alpine as twenty-server

COPY --from=twenty-server-build /app /app

WORKDIR /app/packages/twenty-server

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

CMD ["node", "dist/src/main"]
