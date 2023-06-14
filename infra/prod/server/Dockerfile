FROM node:18.16.0-alpine as server

WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/yarn.lock ./
RUN yarn install

COPY ./server .
RUN npx prisma generate

RUN yarn build

CMD ["node", "dist/main"]
