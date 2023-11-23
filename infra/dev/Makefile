build:
	@docker compose down 
	rm -rf ../../front/node_modules
	rm -rf ../../server/node_modules
	rm -rf ../../docs/node_modules
	@docker volume rm twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker compose build

provision-postgres-docker:
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose up --build postgres -d

provision-postgres-macos:
	sh ./scripts/setup-postgres-macos.sh

provision-postgres-linux:
	sh ./scripts/setup-postgres-linux.sh

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

server-database-init:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:init"

server-database-setup:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:setup"

server-database-migrate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:migrate"

server-database-seed:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:seed"

server-database-reset:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:reset"
