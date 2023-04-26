FROM postgres:13.7 as postgres

RUN apt update && apt install -y curl

COPY init.sql /docker-entrypoint-initdb.d/
