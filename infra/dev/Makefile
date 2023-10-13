build:
	@docker compose down 
	@docker volume rm dev_twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker compose build

provision-postgres:
	@docker version > /dev/null 2>&1 || (echo "Docker is not running" && exit 1)
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose up --build postgres -d

up:
	@docker compose up -d

down:
	@docker compose down -v

sh:
	@docker compose exec twenty-dev sh

front-start:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn start"

front-lint:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn lint"

front-test:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn test"

front-coverage:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn coverage"

front-graphql-generate:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn graphql:generate"

front-storybook:
	@docker compose exec twenty-dev sh -c "cd ./front && yarn storybook:dev"

server-start:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn start:dev"

server-prisma-generate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:generate"

server-prisma-migrate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:migrate"

server-prisma-seed:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:seed"

server-prisma-reset:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:reset"
