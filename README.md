# Twenty

Welcome to Twenty documentation!

## High Level Overview

Twenty development stack is composed of 3 different layers
- front: our frontend React app
- server: our backend that contain endpoint, crm logic, scripts, jobs...
- storages: postgres

## Development environment setup with npm (Alternative 1)

This is the easiest way to get started contributing to twenty
Make sure you have `node@18` installed on your machine. You can use `nvm` to manage your nvm versions in case you have projects that require different node versions.

`npm install`
`npm start`

You'll need to provide your own postgres storage.

Once this is completed you should have:
- front available on: http://localhost:3001
- server available on: http://localhost:3000/health


## Development environment setup with docker-compose (Alternative 2)

We also provide a containerized environment with Docker and orchestrated with docker-compose in case it is easier for you. This install will also provision a postgres container out of the box.

### Step 1: pre-requesites
Make sure to have the latest Docker and Docker-compose versions installed on your computer.

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

### Step 3: environment file
Configure your environment by copying the `.env.example` file located in `infra/dev` folder into `.env`.
```
cp infra/dev/.env.example infra/dev/.env
```

Then, you'll need to replace all REPLACE_ME variable by their development value. Please reach out to another engineer to get these values (as most of them are third party credentials, sensitive data)

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