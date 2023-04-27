#!/bin/bash

graphql-engine serve &
echo "Waiting for Hasura to be ready..."

while ! curl -s http://localhost:8080/healthz > /dev/null ; do 
  sleep 1
  echo "Waiting for Hasura to be ready..."
done

sleep 1

hasura deploy

wait