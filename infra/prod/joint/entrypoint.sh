#!/bin/sh

# Start the frontend
cd /app/front
npm run start &

# Start the Hasura API
cd /app/hasura
graphql-engine serve &

# Start the documentation
# cd /app/docs
# serve -s . &
 
 # Start the server
cd /app/server
node main &

# Keep the container running
wait

