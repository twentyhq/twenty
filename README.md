# Twenty

Welcome to Twenty documentation!

## High Level Overview

Twenty development stack is composed of 5 different layers:
- twenty-front: our frontend React app
- twenty-api (Hasura): our backend presentation layer that can do straight forward CRUDs, permissionning, authentication.
- twenty-server: our backend that contain complex logics, scripts, jobs...
- [tbd] twenty-events (Jitsu): our event ingestor which is separated from api and server to ensure high availability
- storages: postgres, [tbd] elasticsearch, [tbd] redis.

## Development environment setup

This section only discusses the development setup. The whole developemnt environment is containerized with Docker and orchestrated with docker-compose. 

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
- twenty-front available on: http://localhost:3001
- twenty-api available on: http://localhost:8080
- twenty-server available on: http://localhost:3000/health
- postgres: available on http://localhost:5432 that should contain two database: twenty (data) and hasura (metadata)

### Step 3: environment file
Configure your environment by copying the `.env.example` file located in `infra/dev` folder into `.env`.
```
cp infra/dev/.env.example infra/dev/.env
```

Then, you'll need to replace all REPLACE_ME variable by their development value. Please reach out to another engineer to get these values (as most of them are third party credentials, sensitive data)

### Step 4: API (Hasura) metadata
Browse Hasura console on http://localhost:8080, go to settings and import metadata file located in `infra/dev/twenty-api` folder

## Developping on Frontend

The whole development experience is happening in `infra/dev` folder.
```
cd infra/dev
```

The development FE server is running on docker up and is exposing the `twenty-front` on port http://localhost:3001. As you modify the `/front` folder on your computer, this folder is synced with your `twenty-front` container and the frontend application is automatically refreshed.

### Develop

Recommended: as you modify frontend code, here is how to access `twenty-front` server logs in order to debug / watch typescript issues:
```
make up
make logs container=twenty-front
```

### Open a shell into the container
```
make front-sh
```

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

## Developping on API

The whole development experience is happening in `infra/dev` folder.
```
cd infra/dev
```

The API is a Hasura instance which is a no-code container. 
To modify API behavior, you'll need to connect to run Hasura console through the CLI
```
make api-console
```

Once your local changes in the console are finished you can export them into the filesystem (in order to version them, and deploy them to other environments), depending on your needs:

```
make api-make-migration name=my_migration_name
make api-make-metadata
make api-make-seeds
```

## Developping on server

Section TBD