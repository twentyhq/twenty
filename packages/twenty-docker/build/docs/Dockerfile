FROM node:18.16.0-alpine as docs

WORKDIR /app/docs

ARG SHOULD_INDEX_DOC

COPY ./docs/package.json .
COPY ./docs/yarn.lock .
RUN yarn install

COPY ./docs .
RUN npm run build

RUN yarn global add serve
LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the documentation."

CMD ["serve", "-s", "./build"]
