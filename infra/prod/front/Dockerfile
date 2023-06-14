FROM node:18.16.0-alpine as front

ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_URL

WORKDIR /app/front
COPY ./front .

RUN yarn install --install-links
RUN yarn build

RUN yarn install -g serve

CMD ["serve", "-s", "build"]
