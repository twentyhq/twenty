postgres-on-docker:
	docker run -d \
	--name twenty_pg \
	-e PGUSER_SUPERUSER=postgres \
	-e PGPASSWORD_SUPERUSER=twenty \
	-e ALLOW_NOSSL=true \
	-v twenty_db_data:/home/postgres/pgdata \
	-p 5432:5432 \
	twentycrm/twenty-postgres-spilo:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until PGPASSWORD=twenty psql -h localhost -p 5432 -U twenty -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	PGPASSWORD=twenty psql -h localhost -p 5432 -U twenty -d postgres \
		-c "SELECT 'CREATE DATABASE default' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'default')" \
		-c "SELECT 'CREATE DATABASE test' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'test')"

redis-on-docker:
	docker run -d --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest