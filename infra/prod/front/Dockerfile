FROM node:18.16.0-alpine as build

ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_URL
ARG REACT_APP_FILES_URL

COPY ./packages/ /app/packages

WORKDIR /app/front
COPY ./front .

RUN yarn install
RUN yarn build

FROM node:18.16.0-alpine as front

WORKDIR /app/front
COPY --from=build /app/front/build ./build

RUN yarn global add serve

CMD ["serve", "-s", "build"]
