#!/bin/bash

graphql-engine serve &
echo "Waiting for Hasura to be ready..."

while ! curl -s http://localhost:8080/healthz > /dev/null ; do 
  sleep 1
  echo "Waiting for Hasura to be ready..."
done

sleep 1

hasura deploy

socat TCP-LISTEN:9695,fork,reuseaddr,bind=twenty-hasura TCP:127.0.0.1:9695 &
socat TCP-LISTEN:9693,fork,reuseaddr,bind=twenty-hasura TCP:127.0.0.1:9693 &
hasura console --log-level DEBUG --address "127.0.0.1" --no-browser &

wait