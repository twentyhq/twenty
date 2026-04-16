# DevOps Context - Twenty CRM

## CI/CD Pipeline Topology

### Workflow Organization (GitHub Actions)

#### Pull Request Workflows (on `pull_request`, `merge_group`)
- **ci-front.yaml** — Frontend checks (20-30 min)
  - Jobs: `changed-files-check`, `front-sb-build`, `front-sb-test`, `front-task`, `front-build`
  - Sharded Storybook tests (4 shards × 3 scopes = 12 parallel jobs)
  - Tasks: lint, typecheck, test (matrix)
  - Artifact: Storybook build cached, frontend build uploaded
  
- **ci-server.yaml** — Backend checks (20-30 min)
  - Jobs: `server-build`, `server-lint-typecheck`, `server-validation`, `server-test`, `server-integration-test`
  - Services: postgres:18, redis, clickhouse:25.8.8
  - Integration tests sharded (10 shards)
  - Validates no pending migrations or schema generation

- **ci-merge-queue.yaml** — E2E tests (30 min, runs on merge_group or PR with `run-merge-queue` label)
  - Jobs: `e2e-test`
  - Services: postgres:18, redis
  - Full stack: builds frontend/server, runs Playwright tests
  - Artifact: Playwright results (screenshots, videos, traces)

- **ci-shared.yaml**, **ci-ui.yaml**, **ci-emails.yaml**, etc. — Per-package checks (5-10 min each)
  - Run only when package files change (detected via `changed-files.yaml`)
  - Standard tasks: lint, typecheck, test, build

#### Continuous Deployment Workflows
- **cd-deploy-main.yaml** — Auto-deploy on push to `main`
  - Triggers external repo dispatch to `twentyhq/twenty-infra` (auto-deploy-main event)
  - Infrastructure repo handles actual deployment (not in this repo)

- **cd-deploy-tag.yaml** — Release deployment on version tags
  - Triggers on tags matching `v*.*.*`
  - Dispatches to `twentyhq/twenty-infra` (auto-deploy-tag event)

#### Release Workflows
- **ci-release-create.yaml** — Generate release notes, create GitHub release
- **ci-release-merge.yaml** — Merge release branch back to main

#### Specialized Workflows
- **ci-breaking-changes.yaml** — Detect breaking API changes
- **visual-regression-dispatch.yaml** — Chromatic visual regression tests
- **preview-env-dispatch.yaml** — Deploy ephemeral preview environments
- **ci-test-docker-compose.yaml** — Validate docker-compose setup
- **i18n-pull.yaml**, **i18n-push.yaml** — Crowdin translation sync
- **docs-i18n-pull.yaml**, **docs-i18n-push.yaml** — Docs translation sync
- **post-ci-comments.yaml** — Post CI results as PR comments

### CI Execution Strategy

#### Caching Layers
1. **Yarn dependencies**: `.github/actions/yarn-install` with cache key based on lockfile hash
2. **Nx build cache**: `.nx/cache` persisted across runs (key: `v4-e2e-build-<branch>-<sha>`)
3. **Task-specific caches**: `front-task-lint`, `server-build`, `storybook-build-ubuntu-latest-8-cores-runner`
4. **Test caches**: Jest cache, Playwright browsers

#### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```
- Cancels in-progress runs for same PR when new commits pushed
- Prevents wasted CI time on outdated commits

#### Affected Detection
- Custom action `.github/actions/nx-affected` runs `nx affected -t <task> --tag <scope>`
- Changed files detection via `.github/workflows/changed-files.yaml`
- Skips jobs if no relevant files changed (e.g., skip `ci-front.yaml` if only server files changed)

#### Service Containers (PostgreSQL, Redis, ClickHouse)
```yaml
services:
  postgres:
    image: postgres:18
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: [5432:5432]
    options: --health-cmd pg_isready --health-interval 10s
  
  redis:
    image: redis
    ports: [6379:6379]
  
  clickhouse:
    image: clickhouse/clickhouse-server:25.8.8
    env:
      CLICKHOUSE_PASSWORD: clickhousePassword
      CLICKHOUSE_URL: "http://default:clickhousePassword@localhost:8123/twenty"
    ports: [8123:8123, 9000:9000]
```

#### Runners
- Standard: `ubuntu-latest` (2 cores, 7GB RAM)
- High-performance: `ubuntu-latest-8-cores` (8 cores, 32GB RAM) for Storybook builds, E2E tests

## Required Environment Variables & Secrets

### CI Secrets (GitHub Actions)
- **TWENTY_INFRA_TOKEN**: Personal access token for triggering deployment in `twentyhq/twenty-infra` repo
- **CHROMATIC_PROJECT_TOKEN**: Chromatic project token for visual regression tests (optional)
- **SENTRY_AUTH_TOKEN**: Sentry auth token for source map uploads (optional)

### Runtime Secrets (Self-Hosting)

#### Required (Production)
```bash
# Core
NODE_ENV=production
APP_SECRET=<random-64-char-string>  # Generate: openssl rand -hex 32
PG_DATABASE_URL=postgres://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
FRONTEND_URL=https://your-domain.com

# Server URL (for OAuth callbacks)
SERVER_URL=https://api.your-domain.com
```

#### Authentication (Optional)
```bash
# Google OAuth
AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=<google-client-id>
AUTH_GOOGLE_CLIENT_SECRET=<google-client-secret>
AUTH_GOOGLE_CALLBACK_URL=https://api.your-domain.com/auth/google/redirect
AUTH_GOOGLE_APIS_CALLBACK_URL=https://api.your-domain.com/auth/google-apis/get-access-token

# Microsoft OAuth
AUTH_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CLIENT_ID=<azure-client-id>
AUTH_MICROSOFT_CLIENT_SECRET=<azure-client-secret>
AUTH_MICROSOFT_CALLBACK_URL=https://api.your-domain.com/auth/microsoft/redirect
AUTH_MICROSOFT_APIS_CALLBACK_URL=https://api.your-domain.com/auth/microsoft-apis/get-access-token

# Password login
AUTH_PASSWORD_ENABLED=true

# SAML SSO
# SSL_KEY_PATH=./certs/saml.key
# SSL_CERT_PATH=./certs/saml.crt
```

#### Email (Optional)
```bash
EMAIL_DRIVER=smtp  # or logger (dev), mailgun, sendgrid
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME=Your Company
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=<smtp-user>
EMAIL_SMTP_PASSWORD=<smtp-password>
IS_EMAIL_VERIFICATION_REQUIRED=false
```

#### Storage (Optional)
```bash
STORAGE_TYPE=s3  # or local
# S3 configuration
AWS_ACCESS_KEY_ID=<aws-access-key>
AWS_SECRET_ACCESS_KEY=<aws-secret-key>
AWS_S3_BUCKET_NAME=twenty-storage
AWS_S3_REGION=us-east-1
# Local storage (default)
STORAGE_LOCAL_PATH=.local-storage
```

#### AI Providers (Optional)
```bash
OPENAI_API_KEY=<openai-key>
ANTHROPIC_API_KEY=<anthropic-key>
GOOGLE_API_KEY=<google-ai-key>
XAI_API_KEY=<xai-key>
MISTRAL_API_KEY=<mistral-key>
# Custom providers (JSON)
AI_PROVIDERS='{"my-gateway":{"type":"openai-compatible","baseUrl":"https://api.example.com","apiKey":"..."}}'
AI_MODEL_PREFERENCES='{"recommendedModels":["openai/gpt-4"]}'
```

#### Observability (Optional)
```bash
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
ANALYTICS_ENABLED=true
CLICKHOUSE_URL=http://default:password@clickhouse:8123/twenty
METER_DRIVER=opentelemetry,console
```

#### Billing (SaaS Only)
```bash
IS_BILLING_ENABLED=true
BILLING_STRIPE_API_KEY=<stripe-secret-key>
BILLING_STRIPE_BASE_PLAN_PRODUCT_ID=<product-id>
BILLING_STRIPE_WEBHOOK_SECRET=<webhook-secret>
BILLING_PLAN_REQUIRED_LINK=https://your-domain.com/billing
```

## Local Development Setup

### Prerequisites
- **Node.js**: 24.5.0 (enforced by `.nvmrc`, engines in package.json)
- **Yarn**: 4.13.0+ (managed by Corepack, see `packageManager` in package.json)
- **PostgreSQL**: 18+ (or Docker)
- **Redis**: 6+ (or Docker)

### Automated Setup (Recommended)
```bash
# Clone repository
git clone https://github.com/twentyhq/twenty.git
cd twenty

# Run automated setup script (handles everything)
bash packages/twenty-utils/setup-dev-env.sh

# This script:
# - Detects local Postgres/Redis or starts Docker containers
# - Creates databases (default, test)
# - Copies .env.example → .env for all packages
# - Installs dependencies via Yarn
# - Runs database migrations

# Options:
# --docker    Force Docker mode (use docker-compose.dev.yml)
# --down      Stop services
# --reset     Wipe data and restart fresh
```

### Manual Setup
```bash
# 1. Install dependencies
yarn install

# 2. Start PostgreSQL and Redis
# Option A: Local services
brew install postgresql@18 redis  # macOS
brew services start postgresql@18 redis

# Option B: Docker
cd packages/twenty-docker
docker compose -f docker-compose.dev.yml up -d postgres redis

# 3. Create databases
createdb default
createdb test

# 4. Copy environment files
cp packages/twenty-server/.env.example packages/twenty-server/.env
cp packages/twenty-front/.env.example packages/twenty-front/.env

# 5. Build dependencies
npx nx build twenty-shared

# 6. Initialize database
npx nx database:reset twenty-server

# 7. Start development servers
yarn start
# OR start individually:
npx nx start twenty-front      # http://localhost:3001
npx nx start twenty-server     # http://localhost:3000
npx nx run twenty-server:worker # Background jobs
```

### Verify Setup
```bash
# Check frontend
curl http://localhost:3001

# Check backend health
curl http://localhost:3000/healthz

# Check GraphQL playground
open http://localhost:3000/graphql
```

## Deployment Process

### Docker Compose (Self-Hosting)
```bash
# 1. Clone repository
git clone https://github.com/twentyhq/twenty.git
cd twenty/packages/twenty-docker

# 2. Configure environment
cp .env.example .env
nano .env  # Edit APP_SECRET, PG_DATABASE_URL, etc.

# 3. Start services
docker compose up -d

# Services started:
# - twenty-server (port 3000)
# - twenty-postgres (port 5432)
# - twenty-redis (port 6379)
# - twenty-worker (background jobs)

# 4. Initialize database (first time only)
docker compose exec twenty-server yarn database:init:prod

# 5. Verify
curl http://localhost:3000/healthz
```

### Kubernetes (Helm)
```bash
# 1. Add Helm repository
helm repo add twenty https://twentyhq.github.io/twenty/helm
helm repo update

# 2. Create values file
cat > values.yaml <<EOF
server:
  image:
    tag: latest
  env:
    APP_SECRET: <random-secret>
    PG_DATABASE_URL: postgres://user:pass@postgres:5432/twenty
    REDIS_URL: redis://redis:6379
    FRONTEND_URL: https://twenty.your-domain.com

postgresql:
  enabled: true
  auth:
    username: twenty
    password: <random-password>
    database: twenty

redis:
  enabled: true
EOF

# 3. Install
helm install twenty twenty/twenty -f values.yaml

# 4. Expose service
kubectl port-forward svc/twenty-server 3000:3000

# OR use Ingress for production
kubectl apply -f ingress.yaml
```

### Production Deployment (twentyhq/twenty-infra)
- **Trigger**: Push to `main` or version tag
- **Process**:
  1. GitHub Actions dispatch event to `twenty-infra` repo
  2. Infra repo builds Docker images, pushes to registry
  3. Kubernetes deployment updated with new image tag
  4. Rolling update with zero downtime
  5. Database migrations run automatically (instance commands)
  6. Health checks validate deployment
- **Monitoring**: Sentry, Datadog, CloudWatch (configured in infra repo)

## Runbook

### Common Build Failures

#### "Cannot find module 'twenty-shared'"
**Symptom**: Frontend or server fails to build with module not found error
**Root Cause**: `twenty-shared` not built or stale cache
**Fix**:
```bash
# Rebuild twenty-shared
npx nx build twenty-shared

# Clear Nx cache if issue persists
npx nx reset
```

#### "Port 3000 already in use"
**Symptom**: Server fails to start, port conflict
**Fix**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# OR change port in .env
echo "PORT=3001" >> packages/twenty-server/.env
```

#### Storybook build OOM (out of memory)
**Symptom**: Storybook build crashes with heap allocation failure
**Fix**:
```bash
# Increase Node memory limit
NODE_OPTIONS='--max-old-space-size=10240' npx nx storybook:build twenty-front
```

### Database Issues

#### "Database 'default' does not exist"
**Symptom**: Server crashes on startup
**Fix**:
```bash
# Create database
createdb default  # Or docker exec
npx nx database:reset twenty-server
```

#### Pending migrations detected in CI
**Symptom**: CI fails with "Unexpected migration files were generated"
**Root Cause**: Entity changed but no instance command generated
**Fix**:
```bash
# Generate instance command
npx nx run twenty-server:database:migrate:generate --name <descriptive-name> --type fast

# Commit generated files
git add packages/twenty-server/src/database/commands/upgrade-version-command/instance-commands/*
git commit -m "Add instance command for <change>"
```

#### Database schema out of sync
**Symptom**: TypeORM errors about missing columns/tables
**Fix**:
```bash
# Reset database (DESTRUCTIVE - dev only)
npx nx database:reset twenty-server

# OR run migrations manually
npx nx run twenty-server:database:migrate:prod --force --include-slow
```

### GraphQL Schema Issues

#### Frontend build fails: "Cannot query field X on type Y"
**Symptom**: Frontend compilation error after backend schema change
**Root Cause**: Frontend GraphQL types not regenerated
**Fix**:
```bash
# Start server (required for introspection)
npx nx start twenty-server &

# Regenerate types
npx nx run twenty-front:graphql:generate
npx nx run twenty-front:graphql:generate --configuration=metadata

# Commit generated files
git add packages/twenty-front/src/generated/*
```

### Redis Connection Failures

#### "ECONNREFUSED 127.0.0.1:6379"
**Symptom**: Server crashes, cannot connect to Redis
**Fix**:
```bash
# Start Redis
brew services start redis  # macOS
sudo systemctl start redis # Linux
docker start twenty-redis  # Docker

# Verify
redis-cli ping  # Should return PONG
```

#### Session data not persisting
**Symptom**: Users logged out on page refresh
**Root Cause**: Redis data wiped or wrong REDIS_URL
**Fix**:
```bash
# Check Redis connection
redis-cli -u $REDIS_URL ping

# Verify session keys exist
redis-cli keys "sess:*"

# Check .env has correct REDIS_URL
grep REDIS_URL packages/twenty-server/.env
```

### Worker Process Issues

#### Background jobs not processing
**Symptom**: Emails not sending, calendar not syncing
**Root Cause**: Worker process not running
**Fix**:
```bash
# Start worker
npx nx run twenty-server:worker

# Check queue status (via Redis)
redis-cli llen bull:email-queue:wait
redis-cli llen bull:calendar-queue:wait

# Restart worker if jobs stuck
pkill -f queue-worker
npx nx run twenty-server:worker &
```

### Performance Debugging

#### Slow GraphQL queries
**Tools**:
```bash
# Enable query logging in .env
LOG_LEVELS=error,warn,log,debug

# Check slow query log (PostgreSQL)
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

#### High memory usage
**Tools**:
```bash
# Heap snapshot (Node.js)
kill -SIGUSR2 <pid>  # Generates heap snapshot

# Inspect with Chrome DevTools or clinic.js
npx clinic doctor -- node dist/main.js
```

### CI/CD Debugging

#### "Storybook tests failed"
**Symptom**: `front-sb-test` job fails
**Download Artifacts**:
1. Go to GitHub Actions run
2. Download `playwright-results` artifact
3. Inspect screenshots/videos in `test-results/`

#### "Integration tests timeout"
**Symptom**: `server-integration-test` job times out
**Possible Causes**:
- Database connection pool exhausted (check test parallelism)
- Deadlock in transaction (check test isolation)
- Service container not ready (increase health check retries)

**Fix**: Check CI logs for last test executed before timeout, reproduce locally:
```bash
# Run single integration test
npx jest packages/twenty-server/src/path/to/test.integration-spec.ts --runInBand
```

### Monitoring & Alerting

#### Check service health
```bash
# Health endpoint
curl http://localhost:3000/healthz
# Returns: {"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}}}

# Metrics (if OpenTelemetry enabled)
curl http://localhost:3000/metrics  # Prometheus format
```

#### Sentry error tracking
- **Frontend errors**: `SENTRY_FRONT_DSN` in `.env.example`
- **Backend errors**: `SENTRY_DSN` in `.env.example`
- Errors auto-reported in production (`NODE_ENV=production`)

#### Log aggregation
```bash
# Local development
npx nx start twenty-server | tee server.log

# Docker
docker compose logs -f twenty-server

# Production (example with CloudWatch)
aws logs tail /aws/ecs/twenty-server --follow
```
