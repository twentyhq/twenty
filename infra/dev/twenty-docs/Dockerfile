FROM node:18.16-bullseye as docs

WORKDIR /app/docs

ARG SHOULD_INDEX_DOC

COPY ../../docs/package.json .
COPY ../../docs/yarn.lock .
RUN yarn

COPY ../../docs .

CMD ["yarn", "start"]