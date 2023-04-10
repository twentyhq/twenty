up: ## 
	@docker-compose up -d

logs: ## 
	@docker-compose logs twenty -f

sh: ## 
	@docker-compose exec twenty sh

front-test: ## 
	@docker-compose exec twenty sh -c "cd front && npm run test"

front-coverage: ## 
	@docker-compose exec twenty sh -c "cd front && npm run coverage"

front-storybook: ## 
	@docker-compose exec twenty sh -c "cd front && npm run storybook"
