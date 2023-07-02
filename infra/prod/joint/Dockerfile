# Base node image
FROM node:18.16.0-alpine as base

# Frontend
ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_URL

COPY ./packages/ /app/packages

WORKDIR /app/front
COPY ./front .

RUN apk add --no-cache python3 gcc make g++
RUN yarn install
RUN yarn build

RUN yarn global add serve

# Backend
WORKDIR /app/server
COPY ./server .
RUN yarn install
RUN npm rebuild bcrypt --build-from-source 

RUN npx prisma generate

RUN yarn build

# Nginx
WORKDIR /app
RUN apk add --no-cache nginx gettext supervisor
COPY ./infra/prod/joint/nginx.conf /etc/nginx/nginx.conf.base

# Daemon supervisor
COPY ./infra/prod/joint/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD /bin/sh -c "echo The PORT is $PORT && envsubst '$PORT' < /etc/nginx/nginx.conf.base > /etc/nginx/nginx.conf && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"

