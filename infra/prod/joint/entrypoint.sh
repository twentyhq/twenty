#!/bin/sh

envsubst '${PORT}' < /etc/nginx/nginx.conf.base > /etc/nginx/nginx.conf

# Start the frontend
cd /app/front
serve -s build -l 3001 &

# Start the Hasura API
cd /app/hasura
/usr/bin/graphql-engine serve --port 8080 &

# Start the documentation
# cd /app/docs
# serve -s . &
 
 # Start the server
cd /app/server
SERVER_DATABASE_URL=${SERVER_DATABASE_URL} node dist/main &

nginx

# Keep the container running
wait

