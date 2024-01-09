FROM node:18.17.1-alpine as twenty-website-build

ARG GITHUB_TOKEN
ARG BASE_URL

ENV GITHUB_TOKEN=$GITHUB_TOKEN
ENV BASE_URL=$BASE_URL

WORKDIR /app

COPY ./package.json .
COPY ./.eslintrc.js .
COPY ./yarn.lock .
COPY ./.yarnrc.yml .
COPY ./.yarn/releases /app/.yarn/releases
COPY ./packages/twenty-website /app/packages/twenty-website

RUN yarn
RUN yarn nx build twenty-website

FROM node:18.17.1-alpine as twenty-website

WORKDIR /app/packages/twenty-website

COPY --from=twenty-website-build /app /app

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the website."

CMD ["/bin/sh", "-c", "yarn nx start twenty-website"]