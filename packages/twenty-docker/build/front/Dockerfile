FROM node:18.16.0-alpine as build

ARG REACT_APP_SERVER_BASE_URL
ARG REACT_APP_SERVER_AUTH_URL
ARG REACT_APP_SERVER_FILES_URL

COPY ./packages/ /app/packages

WORKDIR /app/front
COPY ./front .

RUN yarn install
RUN yarn build

COPY ./infra/build/front/serve.json ./build

FROM node:18.16.0-alpine as front

WORKDIR /app/front

COPY --from=build /app/front/build ./build
COPY ./front/scripts/inject-runtime-env.sh /app/front/scripts/inject-runtime-env.sh

RUN yarn global add serve

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the frontend."

CMD ["/bin/sh", "-c", "/app/front/scripts/inject-runtime-env.sh && serve build"]
