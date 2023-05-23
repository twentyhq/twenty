#!/bin/bash

cd "$(dirname "$0")/../infra/dev"

cp .env.example .env

set -o allexport; source .env; set +o allexport

docker-compose up -d postgres

while ! pg_isready -h localhost > /dev/null ; do
  echo "Waiting for Postgres to be ready..."
  sleep 1
done

echo "Postgres is accepting connections!"

docker-compose up -d
