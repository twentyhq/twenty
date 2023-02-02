up: ## 
	@docker-compose up -d

logs: ## 
	@docker-compose logs $(container) -f

api-sh: ## 
	@docker-compose exec twenty-api bash

api-console: ## 
	@docker-compose exec twenty-api bash -c "cd /api; \
		socat TCP-LISTEN:8080,fork TCP:twenty-api:8080 & \
		socat TCP-LISTEN:9695,fork,reuseaddr,bind=twenty-api TCP:127.0.0.1:9695 & \
		socat TCP-LISTEN:9693,fork,reuseaddr,bind=twenty-api TCP:127.0.0.1:9693 & \
		hasura console --log-level DEBUG --address "127.0.0.1" --no-browser || exit 1"

api-make-seed: ##
	@docker-compose exec twenty-api bash -c "cd /api; \
		hasura seeds create seed --from-table $(table)"

api-make-migrations: ##
	@docker-compose exec twenty-api bash -c "cd /api; \
		hasura migrate create $(name)"

api-make-metadata: ##
	@docker-compose exec twenty-api bash -c "cd /api; \
		hasura metadata export"

front-sh: ## 
	@docker-compose exec twenty-front sh

front-test: ## 
	@docker-compose exec twenty-front sh -c "npm run test"

front-coverage: ## 
	@docker-compose exec twenty-front sh -c "npm run coverage"

front-storybook: ## 
	@docker-compose exec twenty-front sh -c "npm run storybook"
