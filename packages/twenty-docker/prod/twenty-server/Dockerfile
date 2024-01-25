FROM node:18.16.0-alpine as twenty-server

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./tools/eslint-rules /app/tools/eslint-rules
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/package.json
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-emails /app/packages/twenty-emails

WORKDIR /app/packages/twenty-emails
RUN yarn workspaces focus
RUN yarn build

WORKDIR /app/packages/twenty-server
COPY ./packages/twenty-server /app/packages/twenty-server
RUN yarn workspaces focus
RUN yarn build

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

CMD ["node", "dist/src/main"]
