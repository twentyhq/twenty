build-dev:
	@docker compose -f dev/docker-compose.yml down 
	rm -rf ../twenty-front/node_modules
	rm -rf ../twenty-server/node_modules
	rm -rf ../twenty-docs/node_modules
	@docker volume rm twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker compose -f dev/docker-compose.yml build

up:
	@docker compose up -d

down:
	@docker compose down -v

sh:
	@docker compose exec twenty-dev sh

provision-postgres-docker:
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose up --build postgres -d

provision-postgres-macos-arm:
	sh ./scripts/setup-postgres-macos-arm.sh

provision-postgres-macos-intel:
	sh ./scripts/setup-postgres-macos-intel.sh

provision-postgres-linux:
	sh ./scripts/setup-postgres-linux.sh
