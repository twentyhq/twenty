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


FROM node:18.17.1-alpine as twenty-front

WORKDIR /app/packages/twenty-front

COPY --from=twenty-front-build /app/packages/twenty-front/build ./build
COPY ./packages/twenty-docker/prod/twenty-front/serve.json ./build
COPY ./packages/twenty-front/scripts/inject-runtime-env.sh /app/packages/twenty-front/scripts/inject-runtime-env.sh
RUN yarn global add serve

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the frontend."

CMD ["/bin/sh", "-c", "./scripts/inject-runtime-env.sh && serve build"]