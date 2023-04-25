FROM node:18.16.0-alpine as docs

WORKDIR /app/docs

COPY ./docs/package.json .
COPY ./docs/package-lock.json .
RUN npm install

COPY ./docs .

RUN npm install -g serve

CMD ["serve", "-s", "build"]
