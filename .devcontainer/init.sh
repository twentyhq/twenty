#!/bin/bash

DEBIAN_FRONTEND=noninteractive

sudo apt-get update
sudo apt-get install -y postgresql-client

cd infra/dev
set -o allexport; source .env; set +o allexport

docker-compose down 
docker volume rm dev_twenty_node_modules_front
docker volume rm dev_twenty_node_modules_server
docker volume rm dev_twenty_node_modules_docs

docker-compose up -d postgres

while ! pg_isready -h localhost > /dev/null ; do
  echo "Waiting for Postgres to be ready..."
  sleep 1
done

echo "Postgres is accepting connections!"

docker-compose up -d twenty-hasura

while ! curl -s http://localhost:8080/healthz > /dev/null ; do 
  sleep 1
  echo "Waiting for Hasura to be ready..."
done

docker-compose up -d hasura-auth

while ! curl -s http://localhost:4000/healthz > /dev/null ; do 
  sleep 1
  echo "Waiting for Hasura to be ready..."
done

docker-compose exec twenty-hasura hasura deploy

docker-compose up -d

docker-compose logs -f
