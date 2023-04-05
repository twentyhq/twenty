FROM node:18-alpine as app

WORKDIR /app
COPY ../.. .

RUN npm run install-dev

CMD ["npm", "run", "start"]
