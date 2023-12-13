FROM node:18.16.0-alpine as twenty-docs-build

WORKDIR /app

ARG SHOULD_INDEX_DOC

COPY ./package.json .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./packages/twenty-docs/package.json /app/packages/twenty-docs/package.json
RUN yarn 

COPY ./packages/twenty-docs /app/packages/twenty-docs
RUN yarn nx build twenty-docs

CMD ["tail", "-f", "/dev/null"]

FROM node:18.16.0-alpine as twenty-docs

WORKDIR /app/packages/twenty-docs

COPY --from=twenty-docs-build /app/packages/twenty-docs/build ./build

RUN yarn global add serve

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the documentation."

CMD ["serve", "-s", "./build"]
