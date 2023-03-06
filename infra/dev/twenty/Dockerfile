FROM node:18-alpine as app

WORKDIR /app
COPY ../.. .

WORKDIR /app/front
RUN npm install

WORKDIR /app/server
RUN npm install

WORKDIR /app

CMD ["npm", "run", "start"]
