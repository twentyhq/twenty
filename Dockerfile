FROM node:18-alpine as app

WORKDIR /app
COPY . .

WORKDIR /app/front
RUN npm install
RUN npm run build

WORKDIR /app/server
RUN npm install
RUN npm run build

CMD ["npm", "run", "start:prod"]
