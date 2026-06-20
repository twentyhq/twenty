# Deploy de Twenty (crm_sf)

CI/CD: cada push a `main` dispara GitHub Actions, que construye la imagen
(frontend + backend), la sube a GHCR y reinicia los contenedores en el droplet
via SSH. El droplet **no compila**, solo corre la imagen ya construida.

```
git push main  ->  GitHub Actions (build + push a GHCR)  ->  SSH al droplet (pull + up -d)
```

- Imagen: `ghcr.io/bridgestudio-mx/crm_sf`
- Produccion: `https://parks.bridgehub.mx` (IP `157.230.52.8`)

---

# DEPLOY DE CERO (primera vez) — sigue los pasos en orden

## Paso 1 — Configurar GitHub (una vez)

Repo `BridgeStudio-MX/crm_sf` -> Settings -> Secrets and variables -> Actions.

Pestaña **Secrets** -> New repository secret (x3):

| Secret             | Valor                             |
| ------------------ | --------------------------------- |
| `DROPLET_USER`     | `root`                            |
| `DROPLET_PASSWORD` | la contrasena de root del droplet |
| `GHCR_TOKEN`       | PAT (classic) con scope `read:packages` (lo creas en github.com/settings/tokens) |

Pestaña **Variables** -> New repository variable (x1):

| Variable       | Valor              |
| -------------- | ------------------ |
| `DEPLOY_HOSTS` | `["157.230.52.8"]` |

## Paso 2 — Subir el codigo a `main` (dispara el primer build)

Estos archivos (`deploy/` + `.github/workflows/deploy-droplet.yaml`) deben estar
en `main`. Al llegar ahi, GitHub Actions arranca solo: construye la imagen y la
sube a GHCR.

```bash
git add deploy .github/workflows/deploy-droplet.yaml .gitignore
git commit -m "Add Docker deploy (droplet + GitHub Actions)"
git push origin main   # o via Pull Request -> merge a main
```

Verifica en la pestaña **Actions** del repo que el workflow "Deploy to droplet"
termine el job de build (el job de deploy fallara aqui: aun no preparamos el
droplet; lo hacemos en el paso 3). Tras esto, la imagen ya existe en GHCR.

> El `.env` con secretos NO se sube a git (esta en .gitignore). Llega al droplet
> por separado en el paso 3. La imagen viaja SIN secretos.

## Paso 3 — Preparar el droplet (una vez)

Desde tu maquina, en la raiz del repo. El `scp` lleva la carpeta `deploy`
COMPLETA, incluido `deploy/.env` (la copia real con los secretos), al droplet.

```bash
scp -r deploy root@157.230.52.8:/opt/twenty

ssh root@157.230.52.8
GHCR_USER=TU_USUARIO_GITHUB GHCR_TOKEN=TU_PAT bash /opt/twenty/setup-droplet.sh
```

El script hace TODO en el droplet (idempotente, seguro re-ejecutar):
Docker + swap + firewall + deja el `.env` en `/opt/twenty/` + login a GHCR +
baja la imagen + levanta server + worker + Postgres + Redis + Caddy.

## Paso 4 — DNS (una vez)

En tu proveedor de dominio, crea el registro:

```
A    parks.bridgehub.mx    ->    157.230.52.8
```

Caddy emite el certificado SSL (Let's Encrypt) automaticamente en cuanto el DNS
apunte al droplet. No compras nada.

## Paso 5 — Verificar

```bash
ssh root@157.230.52.8 'cd /opt/twenty && docker compose ps && docker compose logs --tail=50 server'
```

Abre `https://parks.bridgehub.mx`. Listo.

---

# OPERACION DIARIA (despues del setup)

A partir de aqui, desplegar = hacer push. Nada manual.

```bash
git push origin main
```

Cada push a `main`: Actions reconstruye la imagen, la sube a GHCR, y el droplet
hace `pull` + `up -d` con el nuevo codigo. El `.env` del droplet se reutiliza.

---

# REFERENCIA

## Desarrollo LOCAL con hot-reload (http://localhost:3001)

Enfoque hibrido: Docker corre solo Postgres + Redis; la app corre con `yarn
start` en modo watch, asi cada cambio en el codigo se refleja automaticamente.

```bash
# 1. Infra (Postgres + Redis) en Docker + .env + migraciones (idempotente)
bash packages/twenty-utils/setup-dev-env.sh --docker

# 2. App con hot-reload (frontend + backend + worker)
yarn start

# Abre http://localhost:3001   (server en :3000)
```

Cada vez que guardas un archivo, Vite (frontend) y NestJS (backend) recompilan
y reflejan el cambio solos. Para detener: Ctrl+C, y apagar la infra con
`bash packages/twenty-utils/setup-dev-env.sh --down`.

> Atajo: dile a Claude **"Carga los cambios en local"** y ejecuta estos pasos
> por ti (definido en `CLAUDE.md`).

## Archivos

| Archivo                    | Uso                                                  |
| -------------------------- | ---------------------------------------------------- |
| `docker-compose.yml`       | Produccion: server + worker + db + redis + Caddy SSL |
| `Caddyfile`                | Reverse proxy + SSL automatico (Let's Encrypt)       |
| `setup-droplet.sh`         | Bootstrap del droplet en una corrida                 |
| `.env`                     | Secretos reales (NO en git, copia local + droplet)   |
| `.env.example`             | Plantilla de variables de produccion                 |
| (local con hot-reload)     | `setup-dev-env.sh --docker` + `yarn start` (ver abajo)     |

## Agregar mas servidores

Prepara cada servidor nuevo con el Paso 3, y añade su IP a la variable
`DEPLOY_HOSTS`, ej: `["157.230.52.8","10.0.0.5"]`. El workflow despliega a todos
en paralelo (deben aceptar el mismo usuario/contrasena, o ajusta los secrets).

## Como llegan los secretos a produccion

El `.env` NO viaja por git ni por la imagen. Llega al droplet UNA vez (via el
`scp` del Paso 3, o generado por `setup-droplet.sh`) y queda en `/opt/twenty/.env`
de forma permanente. Cada deploy lo reutiliza; nunca lo sobreescribe.
