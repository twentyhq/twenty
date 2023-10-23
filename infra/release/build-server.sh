
docker buildx build \
--push \
--platform linux/amd64,linux/arm64 \
-f ./infra/build/server/Dockerfile -t twentycrm/twenty-server:0.1.5 -t twentycrm/twenty-server:latest .