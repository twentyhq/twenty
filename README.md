# twenty

Welcome to Twenty!

## Setup & Development

```
docker-compose -f infra/dev/docker-compose.yml up --build --force-recreate
```

Browse:
- FE/BE: localhost:3000
- Hasura: localhost:8080

## Tests

Ssh into the twenty-server container using:
- `docker ps` to get the container id
- `docker exec -it CONTAINER_ID sh`

### Frontend

```
cd front
npm run test
```

### Backend

```
cd server
npm run test
```

## Production

```
cd front && npm run build
cd ../server && npm run build
```