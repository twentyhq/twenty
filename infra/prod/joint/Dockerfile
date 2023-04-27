# Joint image for hosting providers that don't support docker-compose (e.g. Railway)

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
ARG HASURA_EVENT_HANDLER_SECRET_HEADER
ARG SERVER_DATABASE_URL
WORKDIR /app/server
COPY ./server/package.json ./
COPY ./server/package-lock.json ./
RUN npm install
COPY ./server .
RUN npx prisma generate
RUN npm run build

# Build the frontend
ARG FONTAWESOME_NPM_AUTH_TOKEN
#ARG REACT_APP_API_URL
#ARG REACT_APP_AUTH_URL
WORKDIR /app/front
COPY ./front .
RUN echo "@fortawesome:registry=https://npm.fontawesome.com/" > .npmrc
RUN echo "//npm.fontawesome.com/:_authToken=E09517B1-61FF-48B9-BD2F-601CBFF80D3A" >> .npmrc
RUN npm install
RUN npm run build
RUN npm install -g serve


# Entrypoint script
COPY ./infra/prod/joint/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]


