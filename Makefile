docker-dev-build:
	make -C packages/twenty-docker dev-build

docker-dev-up:
	make -C packages/twenty-docker dev-up

docker-dev-down:
	make -C packages/twenty-docker dev-down

docker-dev-sh:
	make -C packages/twenty-docker dev-sh

postgres-provision-on-docker:
	make -C packages/twenty-docker dev-postgres-build

postgres-provision-on-macos-arm:
	make -C packages/twenty-postgres provision-on-macos-arm

postgres-provision-on-macos-intel:
	make -C packages/twenty-postgres provision-on-macos-intel

postgres-provision-on-linux:
	make -C packages/twenty-postgres provision-on-linux
