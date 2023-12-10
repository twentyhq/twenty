
docker buildx build \
--push \
--no-cache \
--platform linux/amd64,linux/arm64 \
-f ./infra/build/front/Dockerfile -t twentycrm/twenty-front:0.1.5 -t twentycrm/twenty-front:latest .
