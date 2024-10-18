postgres-on-docker:
	docker run \
	--name twenty_postgres \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e POSTGRES_DB=default \
	-v twenty_db_data:/var/lib/postgresql/data \
	-p 5432:5432 \
	twentycrm/twenty-postgres:latest

redis-on-docker:
	docker run -d --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest