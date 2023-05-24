build: ##
	@docker-compose down 
	docker volume rm dev_twenty_node_modules_front || true
	docker volume rm dev_twenty_node_modules_server || true
	docker volume rm dev_twenty_node_modules_docs || true
	docker-compose build

up: ## 
	@docker-compose up -d

down: ##
	@docker-compose down

## Front

front-logs: ## 
	@docker-compose logs twenty-front -f

front-sh: ## 
	@docker-compose exec twenty-front sh

front-test: ## 
	@docker-compose exec twenty-front sh -c "npm run test"

front-coverage: ## 
	@docker-compose exec twenty-front sh -c "npm run coverage"

front-storybook: ## 
	@docker-compose exec twenty-front sh -c "npm run storybook"

front-graphql-generate: ## 
	@docker-compose exec twenty-front sh -c "npm run graphql-generate"
