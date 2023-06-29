build:
	@docker-compose down 
	@docker volume rm dev_twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm dev_twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker-compose build

up:
	@docker-compose up -d

down:
	@docker-compose down

sh:
	@docker-compose exec twenty-dev sh

front-start:
	@docker-compose exec twenty-dev sh -c "cd /app/front && yarn start"

front-lint:
	@docker-compose exec twenty-dev sh -c "cd /app/front && yarn lint"

front-test:
	@docker-compose exec twenty-dev sh -c "cd /app/front && yarn test"

front-graphql-generate:
	@docker-compose exec twenty-dev sh -c "cd /app/front && yarn graphql:generate"

front-storybook:
	@docker-compose exec twenty-dev sh -c "cd /app/front && yarn storybook"

server-start:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn start:dev"

server-prisma-generate-client:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn prisma:generate-client"

server-prisma-generate-nest-graphql:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn prisma:generate-nest-graphql"

server-prisma-migrate:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn prisma:migrate"

server-prisma-seed:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn prisma:seed"

server-prisma-reset:
	@docker-compose exec twenty-dev sh -c "cd /app/server && yarn prisma:reset"
