# Sevalla Deployment Guide for FLCRMLMS

## Overview

This guide covers deploying FLCRMLMS to Sevalla using the custom Docker image from GitHub Container Registry (GHCR).

---

## Prerequisites

1. **Sevalla Account** with a project/application created
2. **Docker Image** available at `ghcr.io/connorbelez/flcrmlms:latest`
3. **PostgreSQL Database** (Sevalla managed or external)
4. **Redis Instance** (Sevalla managed or external)

---

## Environment Variables Configuration

### Required Variables

Sevalla needs these environment variables configured in the application settings:

#### Database Configuration
```
PG_DATABASE_URL=postgres://username:password@hostname:port/database_name
```

**Important**: 
- Must be a full PostgreSQL connection string
- Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`
- Example: `postgres://myuser:mypass@db.internal:5432/twenty`
- Do NOT use socket paths or localhost

#### Redis Configuration
```
REDIS_URL=redis://hostname:6379
```

**Important**:
- Full Redis connection URL
- Example: `redis://redis.internal:6379`
- Add password if required: `redis://:password@hostname:6379`

#### Application Configuration
```
APP_SECRET=your-secure-secret-minimum-32-characters-long
APP_VERSION=0.0.0-production
SERVER_URL=https://your-domain.sevalla.com
```

**Important**:
- `APP_SECRET`: Random string, minimum 32 characters
- `APP_VERSION`: Must be valid semantic version (e.g., `0.0.0-prod`, `1.0.0`)
- `SERVER_URL`: Your actual Sevalla domain (with https://)

### Optional Variables

```
# Disable automatic migrations if needed
DISABLE_DB_MIGRATIONS=false

# Disable cron job registration if needed
DISABLE_CRON_JOBS_REGISTRATION=false

# Storage (S3)
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=your-bucket-name
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com

# Email Configuration
EMAIL_DRIVER=smtp
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Company
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
```

---

## Common Deployment Errors

### Error: "connection to server on socket ... failed"

```
psql: error: connection to server on socket "/run/postgresql/.s.PGSQL.5432" failed: 
No such file or directory
```

**Root Cause**: `PG_DATABASE_URL` is not set or is empty.

**Solution**:
1. Check that `PG_DATABASE_URL` is configured in Sevalla environment variables
2. Verify the format is correct: `postgres://user:password@host:port/database`
3. Ensure it's not using socket paths or localhost
4. Restart the deployment after setting the variable

**To Verify in Sevalla**:
- Go to Application → Environment Variables
- Confirm `PG_DATABASE_URL` is listed
- Check it doesn't show `<not set>` or empty value

### Error: "APP_VERSION must be a valid semantic version"

```
ValidationError: APP_VERSION must be a valid semantic version
```

**Root Cause**: `APP_VERSION` is not in semantic version format.

**Solution**:
Set `APP_VERSION` to a valid semver format:
- ✅ Valid: `0.0.0-production`, `1.0.0`, `1.2.3-beta`
- ❌ Invalid: `abc123`, `main`, `latest`

### Error: "unauthorized" when pulling image

```
Error: pull access denied for ghcr.io/connorbelez/flcrmlms
```

**Root Cause**: Sevalla needs authentication to pull private GHCR images.

**Solution**:
1. Create a GitHub Personal Access Token (PAT):
   - Go to https://github.com/settings/tokens/new
   - Select scope: `read:packages`
   - Generate and copy the token

2. Configure in Sevalla:
   - Go to Application → Settings → Registry Authentication
   - Registry: `ghcr.io`
   - Username: Your GitHub username
   - Password: Your PAT token

### Error: "database does not exist"

```
psql: FATAL: database "default" does not exist
```

**Root Cause**: The database specified in `PG_DATABASE_URL` hasn't been created.

**Solution**:
1. If using Sevalla managed PostgreSQL:
   - The database is usually auto-created
   - Check the database name in the connection string matches

2. If using external PostgreSQL:
   - Connect to PostgreSQL manually
   - Create the database:
     ```sql
     CREATE DATABASE "your_database_name";
     ```

### Error: "password authentication failed"

```
psql: FATAL: password authentication failed for user "postgres"
```

**Root Cause**: Database credentials in `PG_DATABASE_URL` are incorrect.

**Solution**:
1. Verify credentials in Sevalla's database settings
2. Update `PG_DATABASE_URL` with correct username/password
3. If using Sevalla managed DB, use the connection string provided by Sevalla

---

## Sevalla Configuration Steps

### 1. Create Application

1. Log in to Sevalla dashboard
2. Create new application
3. Choose "Docker" as deployment type
4. Set image: `ghcr.io/connorbelez/flcrmlms:latest`

### 2. Configure Registry Authentication

1. Go to Application → Settings → Registry Authentication
2. Add credentials:
   - Registry URL: `ghcr.io`
   - Username: `YOUR_GITHUB_USERNAME`
   - Password: `YOUR_GITHUB_PAT` (with `read:packages` scope)
3. Save

### 3. Create Database

1. In Sevalla dashboard, go to Databases
2. Create PostgreSQL database
3. Note the connection string provided
4. If database name is "default", you may need to quote it in queries

### 4. Create Redis

1. In Sevalla dashboard, go to Databases
2. Create Redis instance
3. Note the connection URL

### 5. Configure Environment Variables

In Application → Environment Variables, add:

```bash
# Required
PG_DATABASE_URL=postgres://user:pass@host:port/dbname
REDIS_URL=redis://host:6379
APP_SECRET=your-secure-secret-32-chars-minimum
APP_VERSION=0.0.0-production
SERVER_URL=https://your-app.sevalla.com

# Optional
DISABLE_DB_MIGRATIONS=false
DISABLE_CRON_JOBS_REGISTRATION=false
STORAGE_TYPE=local
```

### 6. Configure Port

Set the application port to `3000` (the port FLCRMLMS listens on).

### 7. Deploy

1. Click "Deploy" in Sevalla dashboard
2. Monitor deployment logs
3. Watch for:
   - ✅ Image pull successful
   - ✅ Container started
   - ✅ "Running database setup and migrations..."
   - ✅ "Successfully migrated DB!"
   - ✅ "Application is running on: http://0.0.0.0:3000"

---

## Deployment Checklist

Before deploying, verify:

- [ ] Docker image is built and pushed to GHCR
- [ ] GitHub PAT with `read:packages` scope is created
- [ ] Sevalla registry authentication is configured
- [ ] PostgreSQL database is created and accessible
- [ ] Redis instance is created and accessible
- [ ] `PG_DATABASE_URL` is set and in correct format
- [ ] `REDIS_URL` is set
- [ ] `APP_SECRET` is set (32+ characters)
- [ ] `APP_VERSION` is valid semver format
- [ ] `SERVER_URL` matches your Sevalla domain
- [ ] Application port is set to `3000`

---

## Post-Deployment Verification

### 1. Check Application Logs

```
# In Sevalla dashboard
Application → Logs → View Real-time Logs
```

Look for:
- ✅ "Successfully migrated DB!"
- ✅ "Successfully registered all background sync jobs!"
- ✅ "Application is running on: http://0.0.0.0:3000"
- ❌ No error messages or stack traces

### 2. Test Health Endpoint

```bash
curl https://your-app.sevalla.com/healthz
```

Expected response:
```json
{"status":"ok"}
```

### 3. Test Application Access

Visit `https://your-app.sevalla.com` in your browser.

You should see the FLCRMLMS login page.

### 4. Check Worker Process

If you have a separate worker process:
1. Ensure it's configured with the same environment variables
2. Set command to: `yarn worker:prod`
3. Verify it connects to the same database and Redis

---

## GitHub Actions Integration

The repository includes a GitHub Actions workflow that can automatically deploy to Sevalla after building the image.

### Setup Automatic Deployment

1. In your GitHub repository, go to Settings → Secrets and variables → Actions

2. Add these secrets:
   ```
   PG_DATABASE_URL=postgres://...
   REDIS_URL=redis://...
   APP_SECRET=your-secret
   SEVALLA_DEPLOY_WEBHOOK=https://api.sevalla.com/deploy/...
   SEVALLA_API_TOKEN=your-sevalla-api-token
   ```

3. The workflow will:
   - Build the Docker image
   - Push to GHCR
   - Run migrations
   - Trigger Sevalla deployment via webhook

### Workflow File

Located at: `.github/workflows/github_workflows_docker-build-deploy.yaml`

The workflow runs on:
- Push to `main` branch
- Manual trigger via `workflow_dispatch`

---

## Troubleshooting Commands

### Check Environment Variables

In Sevalla console or logs, verify variables are set:
```bash
echo $PG_DATABASE_URL
echo $REDIS_URL
echo $APP_SECRET
```

### Test Database Connection

```bash
# If psql is available in container
psql "$PG_DATABASE_URL" -c "SELECT version();"
```

### Test Redis Connection

```bash
# If redis-cli is available
redis-cli -u "$REDIS_URL" PING
```

### View Entrypoint Logs

The entrypoint script logs helpful information. Look for:
```
Running database setup and migrations...
Using database URL: postgres://***:***@host:port/dbname
Checking database connection...
Database schema exists, running upgrade...
Successfully migrated DB!
```

---

## Database Migration Management

### Initial Setup

On first deployment, the entrypoint will:
1. Check if `core` schema exists
2. If not, run `scripts/setup-db.ts`
3. Run all migrations via `yarn database:migrate:prod`
4. Run upgrade command

### Subsequent Deployments

On future deployments:
1. Checks if `core` schema exists (it does)
2. Runs only `yarn command:prod upgrade`
3. Applies any new migrations

### Manual Migration

If you need to run migrations manually:

```bash
# In Sevalla console
yarn database:migrate:prod
```

### Skip Migrations

If you want to deploy without running migrations:

```
DISABLE_DB_MIGRATIONS=true
```

---

## Scaling Considerations

### Separate Worker Process

For production, run the worker as a separate process:

1. Create a second application in Sevalla
2. Use the same image: `ghcr.io/connorbelez/flcrmlms:latest`
3. Set command to: `yarn worker:prod`
4. Configure same environment variables PLUS:
   ```
   DISABLE_DB_MIGRATIONS=true
   DISABLE_CRON_JOBS_REGISTRATION=true
   ```

### Multiple Server Instances

If running multiple server instances:
- Only ONE instance should run migrations
- Set `DISABLE_DB_MIGRATIONS=true` on additional instances
- Only ONE instance should register cron jobs
- Set `DISABLE_CRON_JOBS_REGISTRATION=true` on additional instances

---

## Security Best Practices

1. **Use Strong Secrets**
   ```bash
   # Generate a secure APP_SECRET
   openssl rand -base64 32
   ```

2. **Restrict Database Access**
   - Use Sevalla managed databases when possible
   - Limit database user permissions
   - Use SSL/TLS for database connections

3. **Secure Redis**
   - Use password authentication
   - Enable SSL/TLS if available
   - Limit access to application only

4. **Environment Variables**
   - Never commit secrets to git
   - Use Sevalla's environment variable management
   - Rotate credentials regularly

5. **GitHub PAT**
   - Use minimal scope (`read:packages` only)
   - Create separate PAT for Sevalla (don't reuse)
   - Set expiration and rotate regularly

---

## Performance Optimization

### Database Connection Pool

If experiencing database connection issues:

```
# Add to environment variables
PG_POOL_MIN=2
PG_POOL_MAX=10
```

### Memory Settings

For large workspaces:

```
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=2048
```

### Redis Memory

Ensure Redis has adequate memory:
- Minimum: 512MB
- Recommended: 1GB+
- Set eviction policy: `maxmemory-policy allkeys-lru`

---

## Monitoring

### Health Checks

Sevalla should monitor: `https://your-app.sevalla.com/healthz`

### Application Logs

Monitor for:
- Database connection errors
- Redis connection errors
- Migration failures
- Memory issues (OOM errors)
- Slow query warnings

### Metrics to Track

- Response time
- Error rate
- Database connection count
- Memory usage
- CPU usage

---

## Rollback Procedure

If deployment fails:

1. **Immediate Rollback**
   - In Sevalla, select previous deployment
   - Click "Rollback"

2. **Check Migrations**
   - If migrations ran, they may need manual rollback
   - Connect to database and check migration table:
     ```sql
     SELECT * FROM core._typeorm_migrations ORDER BY timestamp DESC LIMIT 5;
     ```

3. **Verify Data Integrity**
   - Check that application data is intact
   - Test critical functionality

---

## Support Resources

- **FLCRMLMS Documentation**: See `DOCKER-TEST-GUIDE.md` and `README-CUSTOM.md`
- **Sevalla Documentation**: https://docs.sevalla.com
- **GitHub Actions Logs**: https://github.com/Connorbelez/FLCRMLMS/actions
- **Docker Image**: https://github.com/Connorbelez/FLCRMLMS/pkgs/container/flcrmlms

---

## Quick Reference

### Minimum Environment Variables
```bash
PG_DATABASE_URL=postgres://user:pass@host:port/dbname
REDIS_URL=redis://host:6379
APP_SECRET=your-32-char-secret
APP_VERSION=0.0.0-production
SERVER_URL=https://your-app.sevalla.com
```

### Test Deployment Locally
```bash
docker run --rm \
  -e PG_DATABASE_URL="postgres://..." \
  -e REDIS_URL="redis://..." \
  -e APP_SECRET="test-secret-32-chars-minimum" \
  -e APP_VERSION="0.0.0-local" \
  -e SERVER_URL="http://localhost:3000" \
  -p 3000:3000 \
  ghcr.io/connorbelez/flcrmlms:latest
```

### Debug Database Connection
```bash
# Check if PG_DATABASE_URL is set
echo $PG_DATABASE_URL

# Test connection
psql "$PG_DATABASE_URL" -c "SELECT 1;"
```

---

## Changelog

- **2025-01-13**: Initial Sevalla deployment guide created
- Documented common errors and solutions
- Added environment variable configuration
- Added GitHub Actions integration

---

## Need Help?

If you encounter issues not covered here:

1. Check Sevalla application logs
2. Review GitHub Actions build logs
3. Verify all environment variables are set correctly
4. Test database and Redis connections manually
5. Check the entrypoint script logs for specific errors