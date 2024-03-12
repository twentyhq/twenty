FROM node:18.16.0-alpine as twenty-server

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

WORKDIR /app/packages/twenty-server

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

CMD ["node", "dist/src/main"]
