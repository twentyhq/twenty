# Railway Live Debug Notes

## 2026-05-08 Frontend 502

Observed `https://crm.xopure.com` returning Railway `502 Application failed to respond`.

Root cause from Railway status/logs:

- Service `Xopure_crm` deployed with `RAILPACK` from the repository root.
- Root `package.json` `npm start` is a development command that starts `twenty-server:start` and `twenty-front:start`.
- The frontend Vite dev server listens on localhost only, so Railway cannot expose it.
- Backend tried local Postgres at `127.0.0.1:5432` because `PG_DATABASE_URL` was not set.
- Custom domain target port was `8080`.

Fix:

- Add root `railway.toml` pointing the root-linked service at `services/server/Dockerfile`.
- Keep the custom domain target port at `8080` and set the app to listen on `NODE_PORT=8080` / `PORT=8080`.
- Provision Railway Postgres and Redis for Twenty internal state.
- Set production Twenty variables on the web service: `PG_DATABASE_URL`, `REDIS_URL`, `APP_SECRET`, `SERVER_URL`, `NODE_PORT`, `MESSAGE_QUEUE_TYPE`, and signup/storage/email settings.
