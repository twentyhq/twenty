ARG IMAGE_TAG='15.4.0-debian-11-r45'

FROM bitnami/postgresql:${IMAGE_TAG}

ARG PG_MAIN_VERSION=15
ARG PG_GRAPHQL_VERSION=1.3.0
ARG TARGETARCH

USER root

RUN set -eux; \
    ARCH="$(dpkg --print-architecture)"; \
    case "${ARCH}" in \
       aarch64|arm64) \
         TARGETARCH='arm64'; \
         ;; \
       amd64|x86_64) \
         TARGETARCH='amd64'; \
         ;; \
       *) \
         echo "Unsupported arch: ${ARCH}"; \
         exit 1; \
         ;; \
    esac;

RUN apt update && apt install -y curl

# Install precompiled pg_graphql extensions
RUN curl -L "https://github.com/supabase/pg_graphql/releases/download/v${PG_GRAPHQL_VERSION}/pg_graphql-v${PG_GRAPHQL_VERSION}-pg${PG_MAIN_VERSION}-${TARGETARCH}-linux-gnu.deb" -o pg_graphql.deb
RUN dpkg --install pg_graphql.deb
RUN cp /usr/share/postgresql/15/extension/pg_graphql* /opt/bitnami/postgresql/share/extension/
RUN cp /usr/lib/postgresql/15/lib/pg_graphql* /opt/bitnami/postgresql/lib/

COPY ./infra/build/postgres/init.sql /docker-entrypoint-initdb.d/

USER 1001
ENTRYPOINT [ "/opt/bitnami/scripts/postgresql/entrypoint.sh" ]
CMD [ "/opt/bitnami/scripts/postgresql/run.sh" ]