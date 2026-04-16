# DevOps Context — Twenty CRM

## CI/CD Pipeline Topology

### GitHub Actions Workflows (`.github/workflows/`)

#### **Pull Request & Merge Queue Triggers**
All CI workflows run on `pull_request` and `merge_group` events, with concurrency control to cancel stale runs.

#### **Frontend CI** (`ci-front.yaml`)
- **Changed Files Check**: Only runs if `packages/twenty-front/`, `twenty-ui/`, `twenty-shared/`, or root config changed
- **Jobs**:
  1. **`front-sb-build`** (ubuntu-latest-8-cores): Build Storybook static site
     - Uploads Storybook artifact for test jobs
     - Saves build cache for reuse
  2. **`front-sb-test`** (matrix: 3 scopes × 4 shards = 12 jobs): Run Storybook visual regression tests
     - Uses Playwright in Vitest
     - Downloads Storybook artifact from build job
     - Sharded for parallelization (e.g., `1/4`, `2/4`, ...)
  3. **`front-task`** (matrix: lint, typecheck, test): Run code quality checks
     - Uses `nx-affected` to only check changed projects
     - Caches task outputs for subsequent runs
  4. **`front-build`** (ubuntu-latest-8-cores): Production build of frontend
     - `NODE_OPTIONS=--max-old-space-size=10240` (10GB heap)
     - `ANALYZE=true` (generates bundle size report)
- **Status Check**: `ci-front-status-check` fails if any job failed

#### **Backend CI** (`ci-server.yaml`)
- **Changed Files Check**: Only runs if `packages/twenty-server/`, `twenty-emails/`, `twenty-shared/`, or GraphQL generated files changed
- **Jobs**:
  1. **`server-build`**: Build server with TypeScript, Lingui i18n extraction
     - Caches build output (`dist/`) for downstream jobs
  2. **`server-lint-typecheck`**: Run oxlint + tsgo typecheck
     - Uses `nx-affected` for changed projects only
  3. **`server-validation`**: Smoke tests against real services
     - **Services**: PostgreSQL 18, Redis, ClickHouse 25.8.8
     - Creates test DB, runs migrations, starts server, validates health
     - **Migration Check**: Generates new migration, fails if schema drift detected
     - **Codegen Check**: Regenerates GraphQL types, fails if uncommitted changes
  4. **`server-test`**: Unit tests with Jest
  5. **`server-integration-test`** (matrix: 10 shards): Integration tests with real DB
     - **Services**: PostgreSQL 18, Redis, ClickHouse
     - Sharded across 10 parallel jobs for speed
     - Uses `.env.test` with test credentials
- **Status Check**: `ci-server-status-check` fails if any job failed

#### **Docker CI** (`ci-test-docker-compose.yaml`)
- **Jobs**:
  1. **`test-compose`**: Validates `docker-compose.yml` boots successfully
     - Patches compose file to build from source (not pull image)
     - Waits for DB health check (300s timeout)
     - Waits for server health check (300s timeout)
     - Logs output on failure
  2. **`test-app-dev`**: Validates all-in-one dev image (`twenty-app-dev`)
     - Builds `twenty-app-dev` target from Dockerfile
     - Waits for health check on port 2020
     - Ensures embedded Postgres + Redis start correctly

#### **Package-Specific CIs** (per package)
- **`ci-ui.yaml`**, **`ci-shared.yaml`**, **`ci-sdk.yaml`**, **`ci-zapier.yaml`**, **`ci-emails.yaml`**, **`ci-docs.yaml`**, **`ci-website.yaml`**, **`ci-create-app.yaml`**, **`ci-front-component-renderer.yaml`**
- **Pattern**: Lint → Typecheck → Test → Build (only if files changed)

#### **Deployment Workflows**
- **`cd-deploy-main.yaml`**: On push to `main`, dispatches event to `twentyhq/twenty-infra` repo
  - Uses `TWENTY_INFRA_TOKEN` secret to trigger deployment workflow
  - Payload includes full GitHub context
- **`cd-deploy-tag.yaml`**: On Git tag (e.g., `v0.2.1`), triggers release deployment
- **`preview-env-dispatch.yaml`**: Creates preview environments for PRs (labeled manually)

#### **Utility Workflows**
- **`changed-files.yaml`**: Reusable workflow to detect changed files (used by all CI jobs)
- **`post-ci-comments.yaml`**: Posts CI results as PR comments
- **`docs-i18n-pull.yaml` / `docs-i18n-push.yaml`**: Crowdin integration for translations
- **`visual-regression-dispatch.yaml`**: Chromatic visual regression testing

### CI Configuration Files
- **`nx.json`**: Nx task dependencies (`build` depends on `^build`), caching rules
- **`.github/actions/`**: Custom reusable actions
  - `yarn-install`: Installs dependencies with Yarn cache
  - `nx-affected`: Runs Nx tasks only on affected projects
  - `save-cache` / `restore-cache`: Cache build outputs

### Concurrency & Optimization
- **Concurrency Groups**: Cancel old runs when new commits pushed to same branch
- **Caching**:
  - Yarn dependencies: Cached in `~/.cache/yarn`
  - Build outputs: Cached by job name (e.g., `front-task-lint`)
  - Storybook builds: Cached and restored between jobs
- **Sharding**: Large test suites split across multiple runners (10 shards for backend integration tests)

## Required Environment Variables & Secrets

### **Server Environment Variables** (Production)

#### Database & Storage
- **`PG_DATABASE_URL`** (required): PostgreSQL connection string  
  Format: `postgres://user:password@host:port/database`
- **`REDIS_URL`** (required): Redis connection string  
  Format: `redis://host:port` or `redis://:password@host:port`
- **`CLICKHOUSE_URL`** (optional): ClickHouse connection for analytics  
  Format: `http://user:password@host:port/database`
- **`STORAGE_TYPE`** (required): `local` or `s3`
- **`STORAGE_S3_REGION`** (if S3): AWS region (e.g., `us-east-1`)
- **`STORAGE_S3_NAME`** (if S3): S3 bucket name
- **`STORAGE_S3_ENDPOINT`** (if S3): S3 endpoint URL (e.g., for DigitalOcean Spaces)

#### Security
- **`APP_SECRET`** (required): Random string for JWT signing, session encryption  
  Generate: `openssl rand -base64 32`
- **`SERVER_URL`** (required): Public URL of server (e.g., `https://crm.example.com`)

#### Authentication (OAuth)
- **`AUTH_GOOGLE_CLIENT_ID`** (optional): Google OAuth app client ID
- **`AUTH_GOOGLE_CLIENT_SECRET`** (optional): Google OAuth app secret
- **`AUTH_GOOGLE_CALLBACK_URL`** (optional): OAuth redirect (e.g., `https://crm.example.com/auth/google/callback`)
- **`AUTH_MICROSOFT_CLIENT_ID`** (optional): Microsoft OAuth app client ID
- **`AUTH_MICROSOFT_CLIENT_SECRET`** (optional): Microsoft OAuth app secret
- **`AUTH_MICROSOFT_CALLBACK_URL`** (optional): OAuth redirect

#### Email & Messaging
- **`EMAIL_DRIVER`** (optional): `smtp` or `logger` (default: `logger`)
- **`EMAIL_SMTP_HOST`** (if SMTP): SMTP server hostname
- **`EMAIL_SMTP_PORT`** (if SMTP): SMTP port (e.g., `465`)
- **`EMAIL_SMTP_USER`** (if SMTP): SMTP username
- **`EMAIL_SMTP_PASSWORD`** (if SMTP): SMTP password
- **`EMAIL_FROM_ADDRESS`** (optional): From email address
- **`EMAIL_FROM_NAME`** (optional): From name

#### Feature Flags
- **`MESSAGING_PROVIDER_GMAIL_ENABLED`** (optional): `true` to enable Gmail sync
- **`CALENDAR_PROVIDER_GOOGLE_ENABLED`** (optional): `true` to enable Google Calendar sync
- **`MESSAGING_PROVIDER_MICROSOFT_ENABLED`** (optional): `true` to enable Outlook sync
- **`CALENDAR_PROVIDER_MICROSOFT_ENABLED`** (optional): `true` to enable Microsoft Calendar sync
- **`IS_BILLING_ENABLED`** (optional): `true` to enable Stripe billing
- **`ANALYTICS_ENABLED`** (optional): `true` to enable ClickHouse analytics

#### Monitoring
- **`SENTRY_DSN`** (optional): Sentry error tracking DSN
- **`SENTRY_ENVIRONMENT`** (optional): Environment name (e.g., `production`)

#### Deployment Control
- **`DISABLE_DB_MIGRATIONS`** (optional): `true` to skip auto-migrations on startup (for worker containers)
- **`DISABLE_CRON_JOBS_REGISTRATION`** (optional): `true` to skip cron job registration (for worker containers)
- **`NODE_PORT`** (optional): HTTP port (default: `3000`)
- **`NODE_ENV`** (optional): `production`, `development`, or `test`

### **Frontend Environment Variables**
- **`REACT_APP_SERVER_BASE_URL`** (build-time): Backend server URL (e.g., `http://localhost:3000`)  
  Injected at runtime via `window._env_` by server

### **GitHub Actions Secrets**
- **`DOCKERHUB_USERNAME`** (vars): Docker Hub username for image pulls/pushes
- **`DOCKERHUB_PASSWORD`** (secret): Docker Hub password
- **`TWENTY_INFRA_TOKEN`** (secret): GitHub PAT for dispatching to `twenty-infra` repo
- **`CHROMATIC_PROJECT_TOKEN`** (secret): Chromatic API token for visual regression

### **.env.example** Files
- **`packages/twenty-server/.env.example`**: Template for server config
- **`packages/twenty-docker/.env.example`**: Template for Docker Compose
- **`packages/twenty-front/.env.example`**: Template for frontend dev

## Local Development Setup

### Prerequisites
- **Node.js**: `24.5.0` (exact version enforced in `package.json`)
- **Yarn**: `4.13.0+` (Berry)
- **PostgreSQL**: `16+` (local or Docker)
- **Redis**: Latest (local or Docker)
- **ClickHouse**: `25.8.8` (optional, for analytics features)

### 1. Clone Repository
```bash
git clone https://github.com/twentyhq/twenty.git
cd twenty
```

### 2. Install Dependencies
```bash
# Uses Yarn 4 (corepack)
yarn install
```

### 3. Start Infrastructure (Docker Compose)
```bash
cd packages/twenty-docker
cp .env.example .env

# Generate secrets (Linux/macOS)
echo "APP_SECRET=$(openssl rand -base64 32)" >> .env
echo "PGPASSWORD_SUPERUSER=$(openssl rand -hex 16)" >> .env

# Start Postgres + Redis
docker compose up -d db redis

cd ../..
```

### 4. Configure Server
```bash
cd packages/twenty-server
cp .env.example .env

# Edit .env with local database URL
# PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
# REDIS_URL=redis://localhost:6379
```

### 5. Run Database Migrations
```bash
# From repo root
npx nx run twenty-server:database:init:prod
```

### 6. Start Development Servers
```bash
# Start backend + frontend + worker (concurrently)
yarn start

# Or individually:
npx nx start twenty-server   # Backend on :3000
npx nx start twenty-front     # Frontend on :3001 (Vite dev server)
npx nx run twenty-server:worker  # Worker process
```

### 7. Access Application
- **Frontend**: http://localhost:3001
- **GraphQL Playground**: http://localhost:3000/graphql
- **Metadata API**: http://localhost:3000/metadata

### Alternative: Use All-in-One Docker Image
```bash
docker run -p 2020:2020 \
  -v twenty-data:/data/postgres \
  -v twenty-storage:/app/packages/twenty-server/.local-storage \
  twentycrm/twenty:latest
```
Access at http://localhost:2020 (includes embedded Postgres + Redis)

### Running Tests

#### Frontend Tests
```bash
npx nx test twenty-front                # Unit tests
npx nx storybook:test twenty-front      # Storybook tests (requires built Storybook)
npx nx storybook:build twenty-front     # Build Storybook first
```

#### Backend Tests
```bash
npx nx test twenty-server                          # Unit tests
npx nx test:integration twenty-server              # Integration tests (requires DB)
```

#### Lint & Typecheck
```bash
npx nx lint twenty-front
npx nx typecheck twenty-server
```

### Common Commands
```bash
# Generate GraphQL types after schema change
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata

# Extract/compile translations
npx nx run twenty-server:lingui:extract
npx nx run twenty-server:lingui:compile

# Database commands
npx nx database:migrate:generate twenty-server -- --name add-new-field
npx nx database:migrate twenty-server

# ClickHouse commands
npx nx clickhouse:migrate twenty-server
npx nx clickhouse:seed twenty-server

# Build production artifacts
npx nx build twenty-front
npx nx build twenty-server
```

## Deployment Process

### Docker Compose (Self-Hosted)
1. **Clone repo**:
   ```bash
   git clone https://github.com/twentyhq/twenty.git
   cd twenty/packages/twenty-docker
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env:
   # - Set SERVER_URL to your domain (e.g., https://crm.example.com)
   # - Set APP_SECRET to random string
   # - Configure OAuth credentials (optional)
   # - Set STORAGE_TYPE=s3 and S3 credentials (optional)
   ```

3. **Start services**:
   ```bash
   docker compose up -d
   ```

4. **Verify deployment**:
   ```bash
   curl http://localhost:3000/healthz
   # Should return { "status": "ok" }
   ```

5. **Access UI**: Navigate to http://localhost:3000 (or your SERVER_URL)

### Kubernetes (Helm Chart)
1. **Add Helm repo** (if published):
   ```bash
   helm repo add twenty https://charts.twenty.com
   helm repo update
   ```

2. **Install chart**:
   ```bash
   helm install twenty twenty/twenty \
     --set server.url=https://crm.example.com \
     --set secret.appSecret=$(openssl rand -base64 32) \
     --set postgresql.auth.password=$(openssl rand -hex 16) \
     --set redis.auth.password=$(openssl rand -hex 16)
   ```

3. **Custom values**: Create `values.yaml` to override defaults (OAuth, S3, etc.)

### Production Checklist
- [ ] Set strong `APP_SECRET` (32+ characters, random)
- [ ] Enable HTTPS (reverse proxy with Nginx/Traefik + Let's Encrypt)
- [ ] Configure OAuth (Google/Microsoft) for SSO
- [ ] Set up S3 storage for attachments (not local disk)
- [ ] Enable database backups (PostgreSQL pg_dump cron job)
- [ ] Configure Sentry for error monitoring
- [ ] Set up Redis persistence (AOF or RDB)
- [ ] Limit PostgreSQL max_connections (recommended: 100)
- [ ] Enable firewall rules (only expose :443/:80, block DB ports)
- [ ] Set `NODE_ENV=production`
- [ ] Run migrations manually before deployment: `docker exec twenty-server yarn database:migrate:prod`

## Runbook

### Health Checks

#### Server Health
```bash
curl http://localhost:3000/healthz
# Success: HTTP 200, { "status": "ok" }
# Failure: HTTP 503 or timeout
```

#### Database Connectivity
```bash
docker exec twenty-server npx typeorm query "SELECT 1"
# Success: Returns 1
# Failure: Connection error
```

#### Redis Connectivity
```bash
docker exec twenty-redis redis-cli ping
# Success: PONG
# Failure: Connection refused
```

### Common Failures

#### **Failure: Server Crashes on Startup**
**Symptoms**: `docker logs twenty-server` shows TypeORM connection error

**Diagnosis**:
```bash
docker logs twenty-server 2>&1 | grep -i error
# Look for: "Connection refused", "password authentication failed"
```

**Fix**:
1. Verify PostgreSQL is running: `docker ps | grep postgres`
2. Check `PG_DATABASE_URL` in `.env` matches PostgreSQL credentials
3. Ensure database `default` exists:
   ```bash
   docker exec twenty-db psql -U postgres -c "CREATE DATABASE default;"
   ```
4. Restart server: `docker restart twenty-server`

---

#### **Failure: Frontend Shows "API Error"**
**Symptoms**: Browser console shows `NetworkError: Failed to fetch`

**Diagnosis**:
```bash
curl http://localhost:3000/graphql
# If fails: Backend unreachable
# If succeeds: CORS or frontend config issue
```

**Fix**:
1. Check `REACT_APP_SERVER_BASE_URL` matches actual server URL
2. Verify CORS enabled in NestJS (default: `cors: true` in `main.ts`)
3. Check browser DevTools → Network tab for actual error (401 = auth issue, 500 = server error)

---

#### **Failure: Migrations Fail**
**Symptoms**: Server logs show `Migration <name> failed to run`

**Diagnosis**:
```bash
docker exec twenty-server npx typeorm migration:show
# Shows pending migrations
```

**Fix**:
1. Run migrations manually:
   ```bash
   docker exec twenty-server yarn database:migrate:prod
   ```
2. If migration still fails, check PostgreSQL logs:
   ```bash
   docker logs twenty-db 2>&1 | tail -50
   ```
3. For ClickHouse migrations:
   ```bash
   docker exec twenty-server yarn clickhouse:migrate:prod
   ```

---

#### **Failure: Worker Not Processing Jobs**
**Symptoms**: Emails not syncing, webhooks not firing

**Diagnosis**:
```bash
docker logs twenty-worker
# Check for errors like "Redis connection failed"

docker exec twenty-redis redis-cli LLEN bull:default:wait
# Shows number of queued jobs
```

**Fix**:
1. Ensure worker container is running: `docker ps | grep worker`
2. Check Redis connectivity from worker:
   ```bash
   docker exec twenty-worker node -e "const Redis = require('ioredis'); const r = new Redis(process.env.REDIS_URL); r.ping().then(console.log).catch(console.error);"
   ```
3. Restart worker: `docker restart twenty-worker`

---

#### **Failure: Out of Disk Space**
**Symptoms**: PostgreSQL or file uploads fail with "No space left on device"

**Diagnosis**:
```bash
docker exec twenty-server df -h
# Check /app/packages/twenty-server/.local-storage usage
```

**Fix**:
1. Clean up old files (if using local storage):
   ```bash
   docker exec twenty-server find .local-storage -type f -mtime +30 -delete
   ```
2. Migrate to S3:
   - Set `STORAGE_TYPE=s3` in `.env`
   - Configure `STORAGE_S3_*` variables
   - Restart server

---

#### **Failure: High Memory Usage**
**Symptoms**: Server OOM killed, Docker shows `exit code 137`

**Diagnosis**:
```bash
docker stats twenty-server
# Check MEM USAGE
```

**Fix**:
1. Increase Node.js heap size:
   ```bash
   docker run -e NODE_OPTIONS="--max-old-space-size=4096" twentycrm/twenty
   ```
2. Scale horizontally (multiple server containers behind load balancer)
3. Check for memory leaks in application code (profile with Chrome DevTools)

---

#### **Failure: Slow GraphQL Queries**
**Symptoms**: Frontend slow, server CPU high

**Diagnosis**:
```bash
# Enable query logging in PostgreSQL
docker exec twenty-db psql -U postgres -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
docker restart twenty-db

# Check slow query log
docker logs twenty-db 2>&1 | grep "duration:"
```

**Fix**:
1. Add database indexes (create migration for missing indexes)
2. Optimize N+1 queries (use DataLoader in GraphQL resolvers)
3. Enable query caching in Apollo Client

---

### Log Locations
- **Server Logs**: `docker logs twenty-server`
- **Worker Logs**: `docker logs twenty-worker`
- **PostgreSQL Logs**: `docker logs twenty-db`
- **Redis Logs**: `docker logs twenty-redis`
- **Sentry**: https://sentry.io (if configured)

### Emergency Commands
```bash
# Restart all services
docker compose restart

# Flush Redis cache (resets sessions)
docker exec twenty-redis redis-cli FLUSHDB

# Rollback last migration
docker exec twenty-server npx typeorm migration:revert

# Backup database
docker exec twenty-db pg_dump -U postgres default > backup_$(date +%Y%m%d).sql

# Restore database
cat backup.sql | docker exec -i twenty-db psql -U postgres default
```

---

**For production support**: Contact via GitHub Discussions or Discord (https://discord.gg/cx5n4Jzs57)
