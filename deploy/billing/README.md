# Deploying Twenty to billing.rxreport.com

Runbook for hosting this Twenty fork at **https://billing.rxreport.com** on the existing
Linode box (`rxreport@172.234.239.241`), alongside the current rxreport-app / airflow / mssql
stacks. The host already runs Docker + nginx + certbot; internal services bind `127.0.0.1`.

| Thing | Value |
|-------|-------|
| App dir on server | `/opt/rxreport/twenty/` |
| Image | `ghcr.io/rxreport/twenty:latest` (built by `.github/workflows/billing-image.yml`) |
| Host port | `127.0.0.1:3100` → container `3000` (3000/3030/4000/4040/8001/8002 are taken) |
| Reverse proxy | host nginx vhost `billing` → `localhost:3100`, TLS via certbot |
| Database | fresh, isolated Postgres in the compose project `twenty-billing` |

## 1. Build & publish the image (CI)
Push to `main` (or run the **billing-image** workflow manually). It builds the `twenty` target
and pushes `ghcr.io/rxreport/twenty:latest`. Ensure the GitHub repo allows GHCR package writes.

## 2. DNS
Add an **A record**: `billing.rxreport.com → 172.234.239.241` (only `app` / `api` exist today).
Wait for it to resolve before running certbot.

## 3. First-time server setup
```bash
ssh rxreport-prod
sudo mkdir -p /opt/rxreport/twenty && sudo chown rxreport:rxreport /opt/rxreport/twenty
# copy deploy/billing/docker-compose.yml and .env.example into /opt/rxreport/twenty/
cd /opt/rxreport/twenty
cp .env.example .env
# edit .env: set APP_SECRET (openssl rand -base64 32) and PG_DATABASE_PASSWORD
docker compose pull
docker compose up -d
docker compose logs -f server   # wait for migrations + "healthy"; check /healthz
curl -fsS http://127.0.0.1:3100/healthz && echo OK
```

## 4. nginx + TLS
```bash
sudo cp nginx-billing.conf /etc/nginx/sites-available/billing
sudo ln -s /etc/nginx/sites-available/billing /etc/nginx/sites-enabled/billing
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d billing.rxreport.com   # adds the 443 block + http->https redirect
```
Visit https://billing.rxreport.com, "Continue with Email", and create the first workspace/user.

## 5. Ship the data model (objects)
From the `rxreport-billing-app` project (see its README):
```bash
yarn twenty remote:add      # url https://billing.rxreport.com + an API key from the workspace
yarn twenty app:deploy      # installs all objects, fields, relations + the fee-schedule function
```
Then do the one-time **Opportunity → Claim** relabel in Settings → Data model
(steps in `rxreport-billing-app/README.md`).

## 6. Updates later
```bash
# after CI pushes a new image:
cd /opt/rxreport/twenty && docker compose pull && docker compose up -d
# after changing the data model:
cd rxreport-billing-app && yarn twenty app:deploy
```

## Notes
- **Fresh empty DB**: the compose ships its own Postgres. Nothing is shared with rxreport-app.
- **Backups**: the `db-data` and `server-local-data` named volumes hold all state.
- **Frontend build memory**: the image build needs ~8 GB; build in CI (or a 16 GB runner), not
  on the 23 GB host during traffic.
