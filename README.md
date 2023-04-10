# Twenty

Welcome to Twenty documentation!

## High Level Overview

Twenty development stack is composed of 3 different layers
- front: our frontend React app
- server: our backend that contain endpoint, crm logic, scripts, jobs...
- storages: postgres

## Setup env variables

1. `cp ./infra/dev/.front.env.example ./front/.env` and fill with values

## Development environment setup with npm (Not recommended)

This is the easiest way to get started contributing to twenty
Make sure you have `node@18` installed on your machine. You can use `nvm` to manage your nvm versions in case you have projects that require different node versions.

`npm run install-dev`
`npm run front`

You'll need to provide your own postgres storage.

Once this is completed you should have:
- front available on: http://localhost:3001
- server available on: http://localhost:3000/health


## Development environment setup with docker-compose (Recommended)

We also provide a containerized environment with Docker and orchestrated with docker-compose in case it is easier for you. This install will also provision a postgres container out of the box.

### Step 1: pre-requesites
Make sure to have the latest Docker and Docker-compose versions installed on your computer. You can run `docker-compose --version` to check if you have docker-compose installed and `docker --version` to check if you have docker installed.

### Step 2: docker build
Build docker containers.

The whole setup experience is happening in `infra/dev` folder. Make sure to be in this folder:
```
cd infra/dev
```

```
docker-compose up --build --force-recreate
```

Once this is completed you should have:
- front available on: http://localhost:3001
- server available on: http://localhost:3000/health
- postgres: available on http://localhost:5432 that should contain `twenty` database

### Step 3: IDE setup

If you are using VSCode, please use the `Dev Containers` extension to open the project in a container. This will allow you to run Visual Studio on top of the docker container. This will allow you to run the project without having to install node on your machine. 

### Note

If you are using Docker install, make sure to ssh in the docker container during development to execute commands. You can also use `Makefile` to help you

## Development

### Tests

#### Unit tests:

```
make front-test
# coverage
make front-coverage
```

#### Storybook:
```
make front-storybook
```

## Developping on server

Section TBD