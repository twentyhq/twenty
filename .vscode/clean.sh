#!/bin/bash

cd "$(dirname "$0")/../infra/dev"

docker-compose down 
docker volume rm dev_twenty_node_modules_front
docker volume rm dev_twenty_node_modules_server
docker volume rm dev_twenty_node_modules_docs
