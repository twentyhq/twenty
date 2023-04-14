FROM node:18-alpine as server

COPY ./server/package.json ./
RUN npm install

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app/server
COPY ./server .


CMD ["npm", "run", "start"]
