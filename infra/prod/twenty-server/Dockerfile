FROM node:18-alpine as app

ARG REACT_APP_API_URL
ARG REACT_APP_AUTH0_DOMAIN
ARG REACT_APP_AUTH0_CLIENT_ID
ARG REACT_APP_AUTH0_CALLBACK_URL
ARG REACT_APP_AUTH0_AUDIENCE

WORKDIR /app
COPY . .

WORKDIR /app/front
RUN npm install
RUN npm run build

WORKDIR /app/server
RUN npm install
RUN npm run build

CMD ["npm", "run", "start:prod"]
