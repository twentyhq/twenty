FROM hasura/graphql-engine:latest as api

ARG HASURA_GRAPHQL_JWT_SECRET
ENV HASURA_GRAPHQL_JWT_SECRET=${HASURA_GRAPHQL_JWT_SECRET}

CMD ["sh", "-c", "graphql-engine serve"]
