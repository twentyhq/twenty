ARG IMAGE_TAG='15.5.0-debian-11-r15'

FROM bitnami/postgresql:${IMAGE_TAG}

ARG PG_MAIN_VERSION=15
ARG WRAPPERS_VERSION=0.2.0
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

RUN apt update && apt install build-essential git curl default-libmysqlclient-dev -y

# Install precompiled supabase wrappers extensions
RUN curl -L "https://github.com/supabase/wrappers/releases/download/v${WRAPPERS_VERSION}/wrappers-v${WRAPPERS_VERSION}-pg${PG_MAIN_VERSION}-${TARGETARCH}-linux-gnu.deb" -o wrappers.deb
RUN dpkg --install wrappers.deb
RUN cp /usr/share/postgresql/${PG_MAIN_VERSION}/extension/wrappers* /opt/bitnami/postgresql/share/extension/
RUN cp /usr/lib/postgresql/${PG_MAIN_VERSION}/lib/wrappers* /opt/bitnami/postgresql/lib/

RUN export PATH=/usr/local/pgsql/bin/:$PATH
RUN export PATH=/usr/local/mysql/bin/:$PATH
RUN git clone https://github.com/EnterpriseDB/mysql_fdw.git
WORKDIR mysql_fdw
RUN make USE_PGXS=1
RUN make USE_PGXS=1 install

COPY ./packages/twenty-docker/twenty-postgres/init.sql /docker-entrypoint-initdb.d/

USER 1001
ENTRYPOINT ["/opt/bitnami/scripts/postgresql/entrypoint.sh"]
CMD ["/opt/bitnami/scripts/postgresql/run.sh"]
