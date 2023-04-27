# Joint image for hosting providers that don't support docker-compose (e.g. Railway)

# Build the frontend
FROM node:18.16.0-alpine as front
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat && \
    apk add python3 && \
    apk add make && \
    apk add g++

ARG FONTAWESOME_NPM_AUTH_TOKEN
#ARG REACT_APP_API_URL
#ARG REACT_APP_AUTH_URL

WORKDIR /app/front

COPY ./front .
RUN echo "@fortawesome:registry=https://npm.fontawesome.com/" > .npmrc
RUN echo "//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_AUTH_TOKEN}" >> .npmrc

RUN npm install



# Build the Hasura API
FROM hasura/graphql-engine:latest as api
RUN apt-get update
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
WORKDIR /app/hasura
COPY ./hasura .

# Build the documentation
# FROM node:18.16.0-alpine as docs
# WORKDIR /app/docs
# COPY docs/package.json .
# COPY docs/package-lock.json .
# RUN npm install
# COPY docs .
# RUN npm run build
# RUN npm install -g serve

# Build the server
FROM node:18.16.0-alpine as server
ARG HASURA_EVENT_HANDLER_SECRET_HEADER
ARG SERVER_DATABASE_URL
WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install
COPY ./server .
RUN npx prisma generate
RUN npm run build

# Final image
FROM node:18.16.0-alpine as joint
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add libc6-compat && \
    apk add python3 && \
    apk add make && \
    apk add g++

# Copy artifacts from the previous stages
COPY --from=front /app/front /app/front
COPY --from=api /app/hasura /app/hasura
COPY --from=server /app/server /app/server

# Install serve globally
RUN npm install -g serve

# Entrypoint script
COPY ./infra/prod/joint/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
