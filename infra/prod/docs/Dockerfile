FROM node:18.16.0-alpine as docs

WORKDIR /app/docs

COPY ./docs/package.json .
COPY ./docs/yarn.lock .
RUN yarn install --prod

COPY ./docs .
RUN npm run build

RUN yarn install -g serve

CMD ["serve", "-s", "./build"]
