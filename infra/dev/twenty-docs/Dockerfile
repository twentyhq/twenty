FROM node:18.16-bullseye as docs

WORKDIR /app/docs

ARG NODE_ENV

COPY ../../docs/package.json .
COPY ../../docs/yarn.lock .
RUN yarn

COPY ../../docs .

CMD ["yarn", "start"]