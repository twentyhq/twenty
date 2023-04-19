#!/bin/bash

graphql-engine serve &

while ! curl -s http://localhost:8080/healthz > /dev/null ; do 
  sleep 1
done

hasura deploy

wait