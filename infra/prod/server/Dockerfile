FROM node:18.16.0-alpine as server

COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install


WORKDIR /app/server
COPY ./server .

RUN npm run build

CMD ["node", "dist/main"]
