FROM node:18-alpine as front

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app/front

COPY ../../front/package.json .
COPY ../../front/package-lock.json .
COPY ../../front/.npmrc .
RUN npm install

COPY ../../front .

CMD ["npm", "run", "start"]
