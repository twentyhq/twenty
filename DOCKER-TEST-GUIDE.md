# Docker Compose Testing Guide for FLCRMLMS

This guide will walk you through testing the new Docker Compose setup with your custom GHCR image.

## Prerequisites Check

First, verify you have Docker running:

```bash
docker --version
docker compose version
docker info
```

All commands should succeed. If not, start Docker Desktop or your Docker daemon.

## Step 1: Authenticate with GitHub Container Registry

Since the image `ghcr.io/connorbelez/flcrmlms` is private, you need to authenticate first.

### Option A: Use the Helper Script (Recommended)

```bash
cd packages/twenty-docker
bash setup-ghcr-auth.sh
```

This interactive script will:
- Prompt for your GitHub username
- Prompt for your GitHub Personal Access Token (PAT)
- Authenticate with GHCR
- Verify by pulling the image

### Option B: Manual Authentication

```bash
# Create a GitHub PAT with 'read:packages' scope at:
# https://github.com/settings/tokens/new

export GITHUB_USERNAME="your-username"
export GITHUB_TOKEN="your-token"

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin
```

### Verify Authentication

```bash
docker pull ghcr.io/connorbelez/flcrmlms:latest
```

If this succeeds, you're authenticated! ✅

## Step 2: Set Up Environment Variables

Navigate to the Docker directory:

```bash
cd packages/twenty-docker
```

Create a `.env` file from the template:

```bash
cp .env.template .env
```

Edit `.env` and set the required values:

```bash
# Minimum required configuration:
TAG=latest
SERVER_URL=http://localhost:3000
APP_VERSION=0.0.0-local
APP_SECRET=$(openssl rand -base64 32)
PG_DATABASE_PASSWORD=$(openssl rand -base64 32)
```

Or use these commands to generate secure values:

```bash
cat > .env <<EOF
TAG=latest
SERVER_URL=http://localhost:3000
APP_VERSION=0.0.0-local
APP_SECRET=$(openssl rand -base64 32)
PG_DATABASE_NAME=default
PG_DATABASE_USER=postgres
PG_DATABASE_PASSWORD=$(openssl rand -base64 32)
PG_DATABASE_HOST=db
PG_DATABASE_PORT=5432
REDIS_URL=redis://redis:6379
EOF
```

## Step 3: Pull the Images

```bash
cd packages/twenty-docker
docker compose pull
```

This will pull:
- Your custom FLCRMLMS image from GHCR
- PostgreSQL 16
- Redis

Expected output:
```
[+] Pulling 4/4
 ✔ server Pulled
 ✔ worker Pulled
 ✔ db Pulled
 ✔ redis Pulled
```

## Step 4: Start the Services

```bash
docker compose up -d
```

This starts:
- **db** - PostgreSQL database
- **redis** - Redis cache
- **server** - Main FLCRMLMS application (port 3000)
- **worker** - Background job processor

Expected output:
```
[+] Running 5/5
 ✔ Network twenty_default       Created
 ✔ Container twenty-db-1        Started
 ✔ Container twenty-redis-1     Started
 ✔ Container twenty-server-1    Started
 ✔ Container twenty-worker-1    Started
```

## Step 5: Monitor Startup Progress

Watch the logs to see the services starting:

```bash
docker compose logs -f server
```

Look for these key events:

1. **Database connection established**:
   ```
   [Nest] LOG [TypeOrmModule] Connection to database established
   ```

2. **Migrations running** (this may take 1-2 minutes):
   ```
   [Nest] LOG Running migrations...
   [Nest] LOG Migration CompositeMigration has been executed successfully
   ```

3. **Server ready**:
   ```
   [Nest] LOG Application is running on: http://0.0.0.0:3000
   ```

Press `Ctrl+C` to stop following logs (services keep running).

## Step 6: Check Service Health

Check that all services are healthy:

```bash
docker compose ps
```

Expected output (after ~2-3 minutes):
```
NAME                IMAGE                                    STATUS
twenty-db-1         postgres:16                              Up (healthy)
twenty-redis-1      redis                                    Up (healthy)
twenty-server-1     ghcr.io/connorbelez/flcrmlms:latest     Up (healthy)
twenty-worker-1     ghcr.io/connorbelez/flcrmlms:latest     Up
```

All services should show `Up` or `Up (healthy)`.

## Step 7: Test the Application

### Test Health Endpoint

```bash
curl http://localhost:3000/healthz
```

Expected response:
```json
{"status":"ok"}
```

### Test Main Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the FLCRMLMS login page! 🎉

### Test Worker (Check Logs)

```bash
docker compose logs worker | head -20
```

You should see the worker starting up and connecting to Redis/PostgreSQL.

## Step 8: Verify Specific Fix (microdiff)

The original issue was a missing `microdiff` module in the worker. Let's verify it's fixed:

```bash
docker compose logs worker | grep -i "microdiff\|cannot find module"
```

If there's **no output**, the issue is fixed! ✅

If you see errors, check:

```bash
docker compose logs worker | tail -50
```

## Troubleshooting

### Issue: Authentication Failed

```bash
Error response from daemon: pull access denied for ghcr.io/connorbelez/flcrmlms
```

**Solution**: Re-authenticate with GHCR
```bash
bash packages/twenty-docker/setup-ghcr-auth.sh
```

### Issue: Server Won't Start (APP_VERSION Error)

```bash
APP_VERSION must be a valid semantic version
```

**Solution**: Check your `.env` file has a valid semver format:
```bash
APP_VERSION=0.0.0-local  # ✅ Valid
APP_VERSION=abc123       # ❌ Invalid
```

### Issue: Database Connection Failed

```bash
docker compose logs server | grep -i "database\|connection"
```

**Solution**: Ensure database is healthy:
```bash
docker compose exec db pg_isready -U postgres
```

If unhealthy, restart:
```bash
docker compose restart db
```

### Issue: Worker Module Not Found

```bash
docker compose logs worker | grep "Cannot find module"
```

**Solution**: This means the image needs to be rebuilt. Check that you're using the latest image:
```bash
docker compose pull
docker compose up -d --force-recreate worker
```

### Issue: Services Stuck in Starting State

Wait 3-5 minutes for migrations to complete. If still stuck:

```bash
# Check what's blocking
docker compose logs server | tail -100

# Restart everything
docker compose down
docker compose up -d
```

### Issue: Port 3000 Already in Use

```bash
Error: bind: address already in use
```

**Solution**: Either stop the conflicting service or change the port in `docker-compose.yml`:
```yaml
ports:
  - '3001:3000'  # Change 3001 to any free port
```

## Common Commands

### View All Logs
```bash
cd packages/twenty-docker
docker compose logs -f
```

### View Specific Service Logs
```bash
docker compose logs -f server
docker compose logs -f worker
docker compose logs -f db
```

### Restart a Service
```bash
docker compose restart server
docker compose restart worker
```

### Stop All Services
```bash
docker compose down
```

### Stop and Remove All Data
```bash
docker compose down -v  # ⚠️ This deletes the database!
```

### Access Database
```bash
docker compose exec db psql -U postgres -d default
```

### Access Redis
```bash
docker compose exec redis redis-cli
```

### Run Migrations Manually
```bash
docker compose exec server yarn database:migrate:prod
```

### Check Container Resource Usage
```bash
docker compose stats
```

## Success Criteria

Your Docker Compose setup is working correctly if:

✅ All services show `Up (healthy)` status
✅ `http://localhost:3000/healthz` returns `{"status":"ok"}`
✅ `http://localhost:3000` shows the login page
✅ No "Cannot find module" errors in worker logs
✅ Server logs show successful database connection
✅ Server logs show migrations completed successfully

## Next Steps

Once testing is successful:

1. **Commit the Docker changes**:
   ```bash
   git add packages/twenty-docker/docker-compose.yml
   git add packages/twenty-docker/.env.template
   git add packages/twenty-docker/README-CUSTOM.md
   git add packages/twenty-docker/setup-ghcr-auth.sh
   git commit -m "feat(docker): add GHCR image support and testing tools"
   ```

2. **Update documentation** if needed

3. **Test with different image tags**:
   ```bash
   TAG=main-abc123 docker compose up -d
   ```

4. **Consider production setup** - see `packages/twenty-docker/README-CUSTOM.md`

## Quick Test Script

For automated testing, use the provided test script:

```bash
./test-docker-compose.sh
```

This will:
- Check prerequisites
- Verify GHCR authentication
- Set up `.env` if needed
- Pull images
- Start services
- Wait for health checks
- Test connectivity
- Show next steps

## Additional Resources

- **Custom Docker Setup**: `packages/twenty-docker/README-CUSTOM.md`
- **GHCR Authentication**: `packages/twenty-docker/setup-ghcr-auth.sh --help`
- **GitHub Actions**: `.github/workflows/github_workflows_docker-build-deploy.yaml`
- **Original Twenty Docs**: https://twenty.com/developers/section/self-hosting

## Report Issues

If you encounter issues:

1. Save the logs:
   ```bash
   docker compose logs > docker-logs.txt
   ```

2. Check service status:
   ```bash
   docker compose ps > docker-status.txt
   ```

3. Include in your issue report along with:
   - Docker version: `docker --version`
   - Docker Compose version: `docker compose version`
   - OS: `uname -a`
   - Image tag used
   - Steps to reproduce