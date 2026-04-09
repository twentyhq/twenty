# Database stack

- Coloca aquí los manifests/migrations/infra para la base de datos.
- Docker/Compose para DB deben vivir en esta carpeta (evita duplicados).
- Recomendado: `docker-compose.db.yml` con volúmenes nombrados y variables en `.env`.
- Si usas migraciones (prisma/knex/typeorm/drizzle), deja aquí el directorio `migrations/` o un enlace a él.
