# Note: this image is used for the cloud version of Twenty, you probably don't need this.

FROM node:18.17.1-alpine as twenty-postgres-proxy-build

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./tools/eslint-rules /app/tools/eslint-rules
COPY ./packages/twenty-postgres-proxy/package.json /app/packages/twenty-postgres-proxy/package.json

RUN yarn

COPY ./packages/twenty-postgres-proxy /app/packages/twenty-postgres-proxy

FROM node:18.17.1-alpine as twenty-postgres-proxy

WORKDIR /app/packages/twenty-postgres-proxy

COPY --from=twenty-postgres-proxy-build /app /app

WORKDIR /app/packages/twenty-postgres-proxy

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the postgres-proxy."

CMD ["/bin/sh", "-c", "npx nx start"]