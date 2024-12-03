ARG POSTGRES_VERSION=15
ARG SPILO_VERSION=3.2-p1
ARG WRAPPERS_VERSION=0.2.0

# Build the mysql_fdw extension
FROM debian:bookworm AS build-mysql_fdw
ARG POSTGRES_VERSION

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt install -y \
    build-essential \
    git \
    postgresql-server-dev-${POSTGRES_VERSION} \
    default-libmysqlclient-dev && \
    rm -rf /var/lib/apt/lists/*

# Install mysql_fdw
RUN git clone https://github.com/EnterpriseDB/mysql_fdw.git
WORKDIR /mysql_fdw
RUN make USE_PGXS=1


# Build libssl for wrappers
FROM ubuntu:22.04 AS build-libssl

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
    apt install -y \
    build-essential \
    git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --branch OpenSSL_1_1_1-stable https://github.com/openssl/openssl.git
WORKDIR /build/openssl
RUN ./config && make && make install


# Extend the Spilo image with the mysql_fdw extensions
FROM ghcr.io/zalando/spilo-${POSTGRES_VERSION}:${SPILO_VERSION}
ARG POSTGRES_VERSION
ARG WRAPPERS_VERSION
ARG TARGETARCH

# Install precompiled supabase wrappers extensions
RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
    aarch64|arm64) TARGETARCH='arm64';; \
    amd64|x86_64) TARGETARCH='amd64';; \
    *) echo "Unsupported arch: ${ARCH}"; exit 1;; \
    esac;

RUN apt update && apt install default-libmysqlclient-dev -y && rm -rf /var/lib/apt/lists/*

RUN curl -L "https://github.com/supabase/wrappers/releases/download/v${WRAPPERS_VERSION}/wrappers-v${WRAPPERS_VERSION}-pg${POSTGRES_VERSION}-${TARGETARCH}-linux-gnu.deb" -o wrappers.deb && \
    dpkg --install wrappers.deb && \
    rm wrappers.deb

COPY --from=build-libssl /usr/local/lib/libssl* /usr/local/lib/libcrypto*  /usr/lib/
COPY --from=build-libssl /usr/local/lib/engines-1.1 /usr/lib/engines-1.1

# Copy mysql_fdw
COPY --from=build-mysql_fdw /mysql_fdw/mysql_fdw.so \
    /usr/lib/postgresql/${POSTGRES_VERSION}/lib/mysql_fdw.so
COPY --from=build-mysql_fdw /mysql_fdw/mysql_fdw*.sql /mysql_fdw/mysql_fdw.control /mysql_fdw/mysql_fdw_pushdown.config \
    /usr/share/postgresql/${POSTGRES_VERSION}/extension/
