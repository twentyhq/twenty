FROM node:18.16-bullseye as docs

WORKDIR /app/docs

ARG SHOULD_INDEX_DOC

COPY ../../docs/package.json .
COPY ../../docs/yarn.lock .
RUN yarn

COPY ../../docs .

RUN echo "SHOULD_INDEX_DOC: $SHOULD_INDEX_DOC"

CMD ["yarn", "start"]