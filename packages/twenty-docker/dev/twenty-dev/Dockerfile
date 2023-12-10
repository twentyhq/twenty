FROM node:18.16-bullseye as twenty-dev

COPY /../../packages/twenty-eslint-plugin /app/packages/twenty-eslint-plugin

WORKDIR /app

COPY ../../../../package.json .
COPY ../../../../yarn.lock .
COPY ../../packages/twenty-server/patches ./packages/twenty-server/patches
RUN yarn
RUN npx playwright install-deps 

WORKDIR /app

CMD ["tail", "-f", "/dev/null"]
