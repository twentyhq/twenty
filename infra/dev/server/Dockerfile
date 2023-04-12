FROM node:18-alpine as server

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app/server
COPY ../../server .

RUN npm install

CMD ["npm", "run", "start"]
