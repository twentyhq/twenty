dev-build:
	@docker compose -f dev/docker-compose.yml down -v
	@docker compose -f dev/docker-compose.yml build

dev-up:
	@docker compose -f dev/docker-compose.yml up -d

dev-start:
	@docker compose -f dev/docker-compose.yml start

dev-stop:
	@docker compose -f dev/docker-compose.yml stop

dev-down:
	@docker compose -f dev/docker-compose.yml down -v

dev-sh:
	@docker compose -f dev/docker-compose.yml exec twenty-dev sh

dev-postgres-build:
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose -f dev/docker-compose.yml up --build postgres -d

prod-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty/Dockerfile --tag twenty . && cd -

prod-run:
	@docker run -d -p 3000:3000 --name twenty twenty

prod-postgres-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty-postgres/Dockerfile --tag twenty-postgres . && cd -

prod-postgres-run:
	@docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres --name twenty-postgres twenty-postgres

prod-website-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty-website/Dockerfile --tag twenty-website . && cd -

prod-website-run:
	@docker run -d -p 3000:3000 --name twenty-website twenty-website

release-postgres:
	@cd ../.. && docker buildx build \
		--push \
		--no-cache \
		--platform linux/amd64,linux/arm64 \
		-f ./packages/twenty-docker/twenty-postgres/Dockerfile -t twentycrm/twenty-postgres:$(version) -t twentycrm/twenty-postgres:latest . \
		&& cd -
