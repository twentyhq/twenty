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
	@docker-compose exec twenty-dev sh -c "cd /app/front && npm run start"

front-test:
	@docker-compose exec twenty-dev sh -c "cd /app/front && npm run test"

front-graphql-generate:
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run graphql:generate"

front-storybook:
	@docker-compose exec twenty-dev sh -c "cd /app/front && npm run storybook"

server-start:
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run start:dev"

server-prisma-generate:
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run prisma:generate"
	@echo "Linting generated files..."
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run prisma:lint"

server-prisma-migrate:
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run prisma:migrate"

server-prisma-seed:
	@docker-compose exec twenty-dev sh -c "cd /app/server && npm run prisma:seed"
