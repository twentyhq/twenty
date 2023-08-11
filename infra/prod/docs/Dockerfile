FROM node:18.16.0-alpine as docs

WORKDIR /app/docs

ARG SHOULD_INDEX_DOC

COPY ./docs/package.json .
COPY ./docs/yarn.lock .
RUN yarn install --prod

COPY ./docs .
RUN npm run build

RUN yarn global add serve

CMD ["serve", "-s", "./build"]
