FROM hasura/graphql-engine:latest as api

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y socat
RUN apt-get install -y vim
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash

CMD ["sh", "-c", "graphql-engine serve"]
