prod-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty/Dockerfile --tag twenty . && cd -

kvoip-prod-build:
	@cd ../.. && docker build -t kvoipcrm/v2:canary -f ./packages/twenty-docker/twenty/Dockerfile .

prod-run:
	@docker run -d -p 3000:3000 --name twenty twenty

prod-postgres-run:
	@docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres --name twenty-postgres twenty-postgres

prod-website-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty-website/Dockerfile --tag twenty-website . && cd -

prod-website-run:
	@docker run -d -p 3000:3000 --name twenty-website twenty-website

prod-migrate-kvoipv2-db:
	docker exec -it kvoipv2-server sh -c "yarn database:migrate:prod"
	
