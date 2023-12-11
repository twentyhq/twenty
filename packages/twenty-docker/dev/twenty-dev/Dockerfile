FROM node:18.16-bullseye as twenty-dev

WORKDIR /app
COPY ../../../../package.json .
COPY ../../../../yarn.lock .
COPY ../../../../.yarnrc.yml .
COPY ../../../packages/twenty-front/package.json /app/packages/twenty-front/package.json
COPY ../../../packages/twenty-server/package.json /app/packages/twenty-server/package.json
COPY ../../../packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ../../../packages/eslint-plugin-twenty/package.json /app/packages/eslint-plugin-twenty/package.json

RUN corepack enable
RUN yarn set version 4.0.2
RUN yarn

RUN npx playwright install-deps 

CMD ["tail", "-f", "/dev/null"]
