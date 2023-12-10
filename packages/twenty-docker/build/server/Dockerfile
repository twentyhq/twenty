FROM node:18.16.0-alpine as build

WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/yarn.lock ./
COPY ./server/patches ./patches
RUN yarn install

COPY ./server .
RUN yarn build

LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

CMD ["node", "dist/src/main"]
