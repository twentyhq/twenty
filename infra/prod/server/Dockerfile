FROM node:18.16.0-alpine as server

WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/yarn.lock ./
COPY ./server/patches ./patches

RUN yarn install

RUN npx prisma generate

RUN yarn build

CMD ["node", "dist/src/main"]
