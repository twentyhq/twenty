build:
	@docker compose down 
	@docker volume rm dev_twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker compose build

provision-postgres:
<<<<<<< HEAD
	@docker compose up postgres -d
=======
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose up --build postgres -d
>>>>>>> e67b2d23ae90066954d1e6b0ef94ae9214312f3a

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

<<<<<<< HEAD
server-prisma-generate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:generate"

server-prisma-migrate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:migrate"

server-prisma-seed:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:seed"

server-prisma-reset:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn prisma:reset"
=======
server-database-init:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:init"

server-database-setup:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:setup"

server-database-migrate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:migrate"

server-database-generate:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:generate"

server-database-seed:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:seed"

server-database-reset:
	@docker compose exec twenty-dev sh -c "cd /app/server && yarn database:reset"
>>>>>>> e67b2d23ae90066954d1e6b0ef94ae9214312f3a
