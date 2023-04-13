build: ##
	@docker-compose up --build --force-recreate

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

## Hasura

hasura-logs: ##
	@docker-compose logs twenty-hasura -f

hasura-sh: ##
	@docker-compose exec twenty-hasura sh

hasura-console: ##
	@docker-compose exec twenty-hasura bash -c " \
		socat TCP-LISTEN:9695,fork,reuseaddr,bind=twenty-hasura TCP:127.0.0.1:9695 & \
		socat TCP-LISTEN:9693,fork,reuseaddr,bind=twenty-hasura TCP:127.0.0.1:9693 & \
		hasura console --log-level DEBUG --address "127.0.0.1" --no-browser || exit 1"