FROM node:18.16.0-alpine as server

WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install
RUN npx prisma generate

COPY ./server .

RUN npm run build

CMD ["node", "dist/main"]
