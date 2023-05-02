#!/bin/sh

envsubst '${PORT}' < /etc/nginx/nginx.conf.base > /etc/nginx/nginx.conf

echo "Starting the frontend"
cd /app/front
serve -s build -l 3001 &

echo "Starting the Hasura API"
cd /app/hasura
/usr/bin/graphql-engine serve --port 8080 &

echo "Starting the server"
cd /app/server
node dist/main &

echo "Starting Hasura Auth"
cd /app/hasura-auth
psql $SERVER_DATABASE_URL -f init.sql 
node dist/start &

cd /app/hasura
echo "Deploying Hasura (metadata, migrations...)"
hasura deploy

echo "Starting nginx"
nginx

# Keep the container running
wait

