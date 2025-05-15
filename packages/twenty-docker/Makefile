# Makefile for building Twenty CRM docker images.
# Set the tag and/or target build platform using make command-line variables assignments.
#
# Optional make variables:
# PLATFORM - defaults to 'linux/amd64'
# TAG      - defaults to 'latest'
#
# Example: make
# Example: make PLATFORM=linux/aarch64 TAG=my-tag

PLATFORM ?= linux/amd64
TAG ?= latest

prod-migrate-kvoipv2-db:
	docker exec -it kvoipv2-server sh -c "yarn database:migrate:prod"

prod-sync-metadata:
	docker exec -it kvoipv2-server sh -c "yarn command:prod workspace:sync-metadata"

dev-seed-workspace:
	docker exec -it kvoipv2-server sh -c "yarn command:prod workspace:seed:dev"

prod-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty/Dockerfile --platform $(PLATFORM) --tag twenty:$(TAG) . && cd -

kvoip-prod-build:
	@cd ../.. && docker build -t kvoipcrm/v2:canary -f ./packages/twenty-docker/twenty/Dockerfile .

prod-run:
	@docker run -d -p 3000:3000 --name twenty twenty:$(TAG)

prod-postgres-run:
	@docker run -d -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres --name twenty-postgres twenty-postgres:$(TAG)

prod-website-build:
	@cd ../.. && docker build -f ./packages/twenty-docker/twenty-website/Dockerfile --platform $(PLATFORM) --tag twenty-website:$(TAG) . && cd -

prod-website-run:
	@docker run -d -p 3000:3000 --name twenty-website twenty-website:$(TAG)
