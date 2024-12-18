build-server:
	docker build --progress=plain -f ./packages/twenty-docker/twenty/Dockerfile --tag hexagone/twenty .

build-db:
	docker build -f ./packages/twenty-docker/twenty-postgres-spilo/Dockerfile --tag hexagone/twenty-postgres-spilo .

start-compose:
	docker compose -f packages/twenty-docker/docker-compose.yml up -d

build-front-docker:
	npx nx build twenty-front