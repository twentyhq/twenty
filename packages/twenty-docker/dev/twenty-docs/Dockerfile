FROM node:18.16-bullseye as twenty-docs

WORKDIR /app

COPY ../../../../package.json .
COPY ../../../../yarn.lock .
RUN yarn

CMD ["yarn", "start"]