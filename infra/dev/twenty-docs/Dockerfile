FROM node:18.16-bullseye as docs

WORKDIR /app/docs

COPY ../../docs/package.json .
COPY ../../docs/yarn.lock .
RUN yarn

COPY ../../docs .

CMD ["npm", "run", "start"]