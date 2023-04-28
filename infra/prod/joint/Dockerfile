# Joint image for hosting providers that don't support docker-compose (e.g. Railway)
ARG SERVER_DATABASE_URL
ARG FONTAWESOME_NPM_AUTH_TOKEN

# Build the Hasura API
FROM hasura/graphql-engine:latest as api
RUN apt-get update
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
WORKDIR /app/hasura
COPY ./hasura .

# Final image
FROM api as joint
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    bash \
    git \
    openssh-client \
    libc6 \
    python3 \
    make \
    g++ \
    curl \
    gnupg2 \
    ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get install -y nodejs


# Build the server
WORKDIR /app/server
ENV SERVER_DATABASE_URL ${SERVER_DATABASE_URL}
RUN echo "DBURL"
RUN echo ${SERVER_DATABASE_URL}
RUN echo "FONTAWESOME"
RUN echo ${FONTAWESOME_NPM_AUTH_TOKEN}
RUN echo "HASURA_GRAPHQL_DATABASE_URL"
RUN echo ${HASURA_GRAPHQL_DATABASE_URL}
RUN echo "HASURA_GRAPHQL_PG_DATABASE_URL"
RUN echo ${HASURA_GRAPHQL_PG_DATABASE_URL}
RUN echo "HASURA_GRAPHQL_JWT_SECRET"
RUN echo ${HASURA_GRAPHQL_JWT_SECRET}
COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install
COPY ./server .
RUN npx prisma generate
RUN npm run build

# Build the frontend
WORKDIR /app/front
COPY ./front .
RUN echo "@fortawesome:registry=https://npm.fontawesome.com/" > .npmrc
RUN echo "//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_AUTH_TOKEN}" >> .npmrc
RUN npm install
RUN npm run build
RUN npm install -g serve

# Setup Nginx in front
# https://stackoverflow.com/questions/59692797/how-to-fill-user-input-for-interactive-command-for-run-command
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y nginx gettext-base
COPY ./infra/prod/joint/nginx.conf.base /etc/nginx/nginx.conf.base


# Entrypoint script
COPY ./infra/prod/joint/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]


