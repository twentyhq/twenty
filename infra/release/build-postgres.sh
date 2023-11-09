
docker buildx build \
--push \
--no-cache \
--platform linux/amd64,linux/arm64 \
-f ./infra/build/postgres/Dockerfile -t twentycrm/twenty-postgres:0.2.0 -t twentycrm/twenty-postgres:latest .
