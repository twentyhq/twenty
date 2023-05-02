# Joint image for hosting providers that don't support docker-compose (e.g. Railway)

# Hasura-Auth image
FROM nhost/hasura-auth:latest as auth

# Build the Hasura API
FROM hasura/graphql-engine:latest as api
RUN apt-get update
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
WORKDIR /app/hasura
COPY ./hasura .

# https://stackoverflow.com/questions/59692797/how-to-fill-user-input-for-interactive-command-for-run-command
ENV DEBIAN_FRONTEND=noninteractive

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

ARG FONTAWESOME_NPM_AUTH_TOKEN
ARG SERVER_DATABASE_URL
ARG HASURA_GRAPHQL_PG_DATABASE_URL

# Copy Hasura-Auth to this image
ENV AUTH_PORT 4000
WORKDIR /app/hasura-auth
RUN npm i -g pnpm@7.30.2
COPY --from=auth ./app/package.json ./app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod  && pnpm store prune
COPY --from=auth ./app/migrations/ ./migrations/
COPY --from=auth ./app/email-templates/ ./email-templates
COPY --from=auth ./app/dist dist/

# Build the server
WORKDIR /app/server
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
RUN apt-get install -y nginx gettext-base
COPY ./infra/prod/joint/nginx.conf.base /etc/nginx/nginx.conf.base

# Entrypoint script
COPY ./infra/prod/joint/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]


