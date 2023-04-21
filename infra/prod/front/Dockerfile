FROM node:18.16.0-alpine as front

ARG FONTAWESOME_NPM_AUTH_TOKEN
ARG REACT_APP_API_URL
ARG REACT_APP_AUTH_URL

WORKDIR /app/front
COPY ./front .

RUN echo "@fortawesome:registry=https://npm.fontawesome.com/" > .npmrc
RUN echo "//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_AUTH_TOKEN}" >> .npmrc


RUN npm install
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build"]
