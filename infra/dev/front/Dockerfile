FROM node:18-alpine as front

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app/front
COPY ../../front .

RUN npm install

CMD ["npm", "run", "start"]
