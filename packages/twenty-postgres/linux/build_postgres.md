
This doc explains how to build postgresql for Twenty

Build .control, .so and .pg_graphql--version.sql
> docker buildx create --name mybuilder
> docker buildx use mybuilder

Do the same for <PLATFORM> in ['amd64', 'arm64'] ('amd64' builds faster)
> cd packages/twenty-postgres
> docker buildx build --platform linux/<PLATFORM> --load -t twenty-bitnami-postgres-<PLATFORM> linux
> docker run --name twenty-bitnami-<PLATFORM>  -v ~/Desktop/twenty/packages/twenty-postgres:/twenty <IMAGE_TAG>

In another terminal
> docker exec -it <CONTAINER_TAG> sh
> sh twenty/linux/build-postgres-linux.sh
> cp opt/bitnami/postgresql/lib/pg_graphql.so twenty/linux/<PLATFORM>/15/pg_graphql/<PG_GRAPHQL_VERSION>
> cp opt/bitnami/postgresql/share/extension/pg_graphql.control twenty/linux/<PLATFORM>/15/pg_graphql/<PG_GRAPHQL_VERSION>
> cp opt/bitnami/postgresql/share/extension/pg_graphql--<PG_GRAPHQL_VERSION>.sql twenty/linux/<PLATFORM>/15/pg_graphql/<PG_GRAPHQL_VERSION>

Then
> prod-server-build
> prod-server-run
