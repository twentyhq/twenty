FROM node:18.16-bullseye as twenty-dev

COPY /../../packages/eslint-plugin-twenty /app/packages/eslint-plugin-twenty

WORKDIR /app

COPY ../../../../package.json .
COPY ../../../../yarn.lock .
RUN yarn
RUN npx playwright install-deps 

WORKDIR /app/server

COPY ../../server/package.json .
COPY ../../server/yarn.lock .
COPY ../../server/patches ./patches
RUN yarn install

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
