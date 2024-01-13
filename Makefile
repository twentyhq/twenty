docker-dev-build:
	make -C packages/twenty-docker dev-build

docker-dev-up:
	make -C packages/twenty-docker dev-up

docker-dev-start:
	make -C packages/twenty-docker dev-start

docker-dev-stop:
	make -C packages/twenty-docker dev-stop

docker-dev-sh:
	make -C packages/twenty-docker dev-sh

postgres-on-docker:
	make -C packages/twenty-postgres provision-on-docker

postgres-on-macos-arm:
	make -C packages/twenty-postgres provision-on-macos-arm

postgres-on-macos-intel:
	make -C packages/twenty-postgres provision-on-macos-intel

postgres-on-linux:
	make -C packages/twenty-postgres provision-on-linux
