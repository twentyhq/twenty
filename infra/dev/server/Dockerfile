FROM node:18.16.0-alpine as server

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app/server

COPY ../../server/package.json .
COPY ../../server/package-lock.json .
RUN npm install

COPY ../../server .


CMD ["npm", "run", "start"]