#!/bin/bash

cd "$(dirname "$0")/../infra/dev"

docker-compose logs -f
