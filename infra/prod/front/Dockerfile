FROM node:18.16.0-alpine as front

ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_URL

COPY ../packages/ /app/packages

WORKDIR /app/front
COPY ./front .

RUN yarn install --prod
RUN yarn build

RUN yarn global add serve

CMD ["serve", "-s", "build"]
