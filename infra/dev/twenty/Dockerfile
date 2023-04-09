FROM node:18-alpine as app

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat

WORKDIR /app
COPY ../.. .

RUN npm run install-dev

CMD ["npm", "run", "start"]
