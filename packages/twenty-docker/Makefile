dev-build:
	@docker compose -f dev/docker-compose.yml down 
	rm -rf ../twenty-front/node_modules
	rm -rf ../twenty-server/node_modules
	rm -rf ../twenty-docs/node_modules
	@docker volume rm twenty_node_modules_front > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_server > /dev/null 2>&1 || true
	@docker volume rm twenty_node_modules_docs > /dev/null 2>&1 || true
	@docker compose -f dev/docker-compose.yml build

dev-up:
	@docker compose -f dev/docker-compose.yml up -d

dev-down:
	@docker compose -f dev/docker-compose.yml down -v

dev-sh:
	@docker compose -f dev/docker-compose.yml exec twenty-dev sh

dev-postgres-build:
	@docker stop twenty_postgres || true
	@docker rm twenty_postgres || true
	@docker volume rm twenty_db_data || true
	@docker compose -f dev/docker-compose.yml up --build postgres -d
