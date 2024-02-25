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

prod-docs-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/prod/twenty-docs/Dockerfile --tag twenty-docs . && cd -

prod-docs-run:
	@docker run -d -p 3000:3000 --name twenty-docs twenty-docs

prod-front-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/prod/twenty-front/Dockerfile --tag twenty-front . && cd -

prod-front-run:
	@docker run -d -p 3001:3000 --name twenty-front twenty-front

prod-server-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/prod/twenty-server/Dockerfile --tag twenty-server . && cd -

prod-server-run:
	@docker run -d -p 3000:3000 --name twenty-server twenty-server

prod-postgres-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/prod/twenty-postgres/Dockerfile --tag twenty-postgres . && cd -

prod-postgres-run:
	@docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres --name twenty-postgres twenty-postgres

prod-website-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/prod/twenty-website/Dockerfile --tag twenty-website . && cd -

prod-website-run:
	@docker run -d -p 3000:3000 --name twenty-website twenty-website

release-front:
	@cd ../.. && docker buildx build \
		--push \
		--no-cache \
		--platform linux/amd64,linux/arm64 \
		-f ./packages/twenty-docker/prod/twenty-front/Dockerfile -t twentycrm/twenty-front:$(version) -t twentycrm/twenty-front:latest . \
		&& cd -

release-server:
	@cd ../.. && docker buildx build \
		--push \
		--no-cache \
		--platform linux/amd64,linux/arm64 \
		-f ./packages/twenty-docker/prod/twenty-server/Dockerfile -t twentycrm/twenty-server:$(version) -t twentycrm/twenty-server:latest . \
		&& cd -

release-docs:
	@cd ../.. && docker buildx build \
		--push \
		--no-cache \
		--platform linux/amd64,linux/arm64 \
		-f ./packages/twenty-docker/prod/twenty-docs/Dockerfile -t twentycrm/twenty-docs:$(version) -t twentycrm/twenty-docs:latest . \
		&& cd -

release-postgres:
	@cd ../.. && docker buildx build \
		--push \
		--no-cache \
		--platform linux/amd64,linux/arm64 \
		-f ./packages/twenty-docker/prod/twenty-postgres/Dockerfile -t twentycrm/twenty-postgres:$(version) -t twentycrm/twenty-postgres:latest . \
		&& cd -
