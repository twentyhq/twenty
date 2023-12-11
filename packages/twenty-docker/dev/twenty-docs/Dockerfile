FROM node:18.16-bullseye as twenty-docs

WORKDIR /app

COPY ../../../../package.json .
COPY ../../../../yarn.lock .
COPY ../../../../.yarnrc.yml .
COPY ../../../packages/twenty-docs/package.json /app/packages/twenty-docs/package.json

RUN yarn set version 4.0.2
RUN yarn

WORKDIR /app/packages/twenty-docs

CMD ["tail", "-f", "/dev/null"]
