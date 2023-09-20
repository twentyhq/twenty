ARG PG_VERSION=15
ARG PG_GRAPHQL_VERSION=1.3.0
ARG TARGETARCH=amd64

FROM postgres:${PG_VERSION} as postgres

ENV PG_VERSION=${PG_VERSION} \
    PG_GRAPHQL_VERSION=${PG_GRAPHQL_VERSION} \
    TARGETARCH=${TARGETARCH}

RUN apt update && apt install -y curl

# Install precompiled pg_graphql extensions
RUN curl -L "https://github.com/supabase/pg_graphql/releases/download/v1.3.0/pg_graphql-v1.3.0-pg15-arm64-linux-gnu.deb" -o pg_graphql.deb
RUN dpkg --install pg_graphql.deb

COPY init.sql /docker-entrypoint-initdb.d/
