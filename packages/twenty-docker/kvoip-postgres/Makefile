
PG_VECTOR_IMAGE_NAME=postgres-with-pgvector

PG_VECTOR_IMAGE_TAG=15

build-pg-vector-image:
	docker build -t $(PG_VECTOR_IMAGE_NAME):$(PG_VECTOR_IMAGE_TAG) .

DB_USER=kvoipv2_user
DB_PASSWORD=kvoipv2_password
DB_NAME=kvoipv2_db
CONTAINER_NAME=kvoipv2_pg

kvoip-pg-on-docker:
	docker run -d \
	--name $(CONTAINER_NAME) \
	-e POSTGRES_USER=$(DB_USER) \
  	-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
  	-e POSTGRES_DB=$(DB_NAME) \
	-v kvoipv2_db_data:/home/postgres/pgdata \
	-p 5433:5432 \
	ankane/pgvector:latest
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec $(CONTAINER_NAME) psql -U $(DB_USER) -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec $(CONTAINER_NAME) psql -U $(DB_USER) -d postgres \
		-c "CREATE DATABASE \"kvoipv2_test_db\" WITH OWNER \"$(DB_USER)\";"
	@echo "Installing pgvector extension..."
	docker exec $(CONTAINER_NAME) psql -U $(DB_USER) -d postgres -c \
		"CREATE EXTENSION IF NOT EXISTS vector;"