FROM node:18.16.0-alpine as server

ARG HASURA_EVENT_HANDLER_SECRET_HEADER
ARG SERVER_DATABASE_URL

WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install

COPY ./server .
RUN npx prisma generate

RUN npm run build

CMD ["node", "dist/main"]
