build-kvoip-v2-pg-image:
	docker build -t kvoipcrm-v2/kvoip-pg-spilo:latest -f ./packages/twenty-docker/twenty-postgres-spilo/Dockerfile .

kvoip-v2-postgres-on-docker:
	docker run -d \
	--name kvoipv2_pg \
	-e PGUSER_SUPERUSER=postgres \
	-e PGPASSWORD_SUPERUSER=kvoipv2_password \
	-e ALLOW_NOSSL=true \
	-v kvoip-v2_db_data:/home/postgres/pgdata \
	-p 5433:5432 \
	kvoipcrm-v2/kvoip-pg-spilo:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec kvoipv2_pg psql -U postgres -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec kvoipv2_pg psql -U postgres -d postgres \
		-c "CREATE ROLE \"kvoipv2_user\" SUPERUSER LOGIN PASSWORD 'kvoipv2_password';" \
		-c "CREATE DATABASE \"kvoip-v2_db\" WITH OWNER kvoipv2_user;" \
		-c "CREATE DATABASE \"kvoip-v2_db_test\" WITH OWNER kvoipv2_user;"

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

redis-on-docker:
	docker run -d --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest