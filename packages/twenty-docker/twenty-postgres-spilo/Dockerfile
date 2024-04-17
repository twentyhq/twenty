ARG POSTGRES_VERSION=15
ARG SPILO_VERSION=3.2-p1
ARG PG_GRAPHQL_VERSION=v1.5.2
ARG WRAPPERS_VERSION=0.2.0

# Build the pg_graphql extension
FROM rust AS build-pg_graphql
ARG PG_GRAPHQL_VERSION

WORKDIR /build

RUN apt update && \
    apt install -y --no-install-recommends \
        build-essential \
        libclang-dev \
        libreadline-dev \
        zlib1g-dev \
        flex \
        bison \
        libxml2-dev \
        libxslt-dev \
        libssl-dev \
        libxml2-utils \
        xsltproc \
        ccache \
        pkg-config \
        postgresql-all && \
    rm -rf /var/lib/apt/lists/*

RUN cargo install --locked cargo-pgrx@^0.11 && cargo pgrx init

RUN git clone --branch ${PG_GRAPHQL_VERSION} --depth 1 https://github.com/supabase/pg_graphql.git

WORKDIR /build/pg_graphql

RUN RUST_BACKTRACE=full cargo pgrx install --release

# Build the mysql_fdw extension
FROM ubuntu:22.04 as build-mysql_fdw

ENV DEBIAN_FRONTEND noninteractive
RUN apt update && \
    apt install -y \
        build-essential \
        git \
        postgresql-all \
        libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/*

# Install musql_fdw
RUN git clone https://github.com/EnterpriseDB/mysql_fdw.git
WORKDIR mysql_fdw
RUN make USE_PGXS=1
RUN make USE_PGXS=1 install


# Extend the Spilo image with the pg_graphql and mysql_fdw extensions
FROM ghcr.io/zalando/spilo-${POSTGRES_VERSION}:${SPILO_VERSION}
ARG POSTGRES_VERSION
ARG WRAPPERS_VERSION

# Install precompiled supabase wrappers extensions
RUN curl -L "https://github.com/supabase/wrappers/releases/download/v${WRAPPERS_VERSION}/wrappers-v${WRAPPERS_VERSION}-pg${POSTGRES_VERSION}-amd64-linux-gnu.deb" -o wrappers.deb
RUN dpkg --install wrappers.deb

# Copy pg_graphql
COPY --from=build-pg_graphql /build/pg_graphql/target/release/libpg_graphql.so /usr/lib/postgresql/${POSTGRES_VERSION}/lib/pg_graphql.so
COPY --from=build-pg_graphql /build/pg_graphql/pg_graphql.control /usr/share/postgresql/${POSTGRES_VERSION}/extensions/pg_graphql.control

# Copy mysql_fdw
COPY --from=build-mysql_fdw /mysql_fdw/mysql_fdw.so /usr/lib/postgresql/${POSTGRES_VERSION}/lib/mysql_fdw.so
