FROM hasura/graphql-engine:latest as api

RUN apt-get update
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

WORKDIR /app/hasura
COPY ./hasura .

CMD ["sh", "-c", "graphql-engine serve"]
