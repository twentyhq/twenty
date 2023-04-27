#!/bin/sh

# Start the frontend
cd /app/front
serve -s build -l $PORT &

# Start the Hasura API
cd /app/hasura
/usr/bin/graphql-engine serve &

# Start the documentation
# cd /app/docs
# serve -s . &
 
 # Start the server
cd /app/server
node dist/main &

# Keep the container running
wait

