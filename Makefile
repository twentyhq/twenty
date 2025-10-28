DOCKER_NETWORK=twenty_network

ensure-docker-network:
	docker network inspect $(DOCKER_NETWORK) >/dev/null 2>&1 || docker network create $(DOCKER_NETWORK)

postgres-on-docker: ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_pg \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-e ALLOW_NOSSL=true \
	-v twenty_db_data:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres:16
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec twenty_pg psql -U postgres -d postgres \
		-c 'SELECT pg_is_in_recovery();' 2>/dev/null | grep -q 'f'; do \
		sleep 1; \
	done
	docker exec twenty_pg psql -U postgres -d postgres \
		-c "CREATE DATABASE \"default\" WITH OWNER postgres;" \
		-c "CREATE DATABASE \"test\" WITH OWNER postgres;"

redis-on-docker: ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) --name twenty_redis -p 6379:6379 redis/redis-stack-server:latest

clickhouse-on-docker: ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) --name twenty_clickhouse -p 8123:8123 -p 9000:9000 -e CLICKHOUSE_PASSWORD=devPassword clickhouse/clickhouse-server:latest \

grafana-on-docker: ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_grafana \
	-p 4000:3000 \
	-e GF_SECURITY_ADMIN_USER=admin \
	-e GF_SECURITY_ADMIN_PASSWORD=admin \
	-e GF_INSTALL_PLUGINS=grafana-clickhouse-datasource \
	-v $(PWD)/packages/twenty-docker/grafana/provisioning/datasources:/etc/grafana/provisioning/datasources \
	grafana/grafana-oss:latest

opentelemetry-collector-on-docker: ensure-docker-network
	docker run -d --network $(DOCKER_NETWORK) \
	--name twenty_otlp_collector \
	-p 4317:4317 \
	-p 4318:4318 \
	-p 13133:13133 \
	-v $(PWD)/packages/twenty-docker/otel-collector/otel-collector-config.yaml:/etc/otel-collector-config.yaml \
	otel/opentelemetry-collector-contrib:latest \
	--config /etc/otel-collector-config.yaml