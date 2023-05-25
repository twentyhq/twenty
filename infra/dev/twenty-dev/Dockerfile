FROM node:18.16.0-alpine as front

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat && \
    apk add python3 && \
    apk add make && \
    apk add g++

WORKDIR /app/front

COPY ../../front/package.json .
COPY ../../front/package-lock.json .
RUN npm install

COPY ../../front .

WORKDIR /app/server

COPY ../../server/package.json .
COPY ../../server/package-lock.json .
RUN npm install

COPY ../../server .
RUN npx prisma generate

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
