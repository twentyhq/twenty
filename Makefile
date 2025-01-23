postgres-on-docker:
	docker run -d \
	--name twenty_pg \
	-e PGUSER_SUPERUSER=postgres \
	-e PGPASSWORD_SUPERUSER=postgres \
	-e ALLOW_NOSSL=true \
	-v twenty_db_data:/home/postgres/pgdata \
	-p 5432:5432 \
	twentycrm/twenty-postgres-spilo:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec twenty_pg psql -U postgres -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec twenty_pg psql -U postgres -d postgres \
		-c "CREATE DATABASE \"default\" WITH OWNER postgres;" \
		-c "CREATE DATABASE \"test\" WITH OWNER postgres;"

kvoip-postgres-on-docker:
	docker run -d \
	--name kvoipv2_pg \
	-e PGUSER_SUPERUSER=kvoipv2_user \
	-e PGPASSWORD_SUPERUSER=kvoipv2_password \
	-e ALLOW_NOSSL=true \
	-v kvoipv2_db_data:/home/postgres/pgdata \
	-p 5433:5432 \
	twentycrm/twenty-postgres-spilo:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec kvoipv2_pg psql -U kvoipv2_user -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec kvoipv2_pg psql -U kvoipv2_user -d postgres \
		-c "CREATE DATABASE \"kvoipv2_db\" WITH OWNER kvoipv2_user;" \
		-c "CREATE DATABASE \"kvoipv2_test_db\" WITH OWNER kvoipv2_user;"

redis-on-docker:
	docker run -d --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest