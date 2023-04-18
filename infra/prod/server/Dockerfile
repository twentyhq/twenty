FROM node:18-alpine as server

COPY ./server/package.json ./
RUN npm install


WORKDIR /app/server
COPY ./server .

RUN npm run build

CMD ["node", "dist/main"]
