FROM node:18.16-bullseye as front

COPY /../../packages /app/packages

WORKDIR /app/front

COPY ../../front/package.json .
COPY ../../front/yarn.lock .
RUN yarn install
RUN npx playwright install-deps 

WORKDIR /app/server

COPY ../../server/package.json .
COPY ../../server/yarn.lock .
COPY ../../server/patches ./patches
RUN yarn install

WORKDIR /app

COPY ../.. .

WORKDIR /app/server
RUN yarn database:setup
RUN yarn database:reset

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
