# Running FLCRMLMS with Docker Compose

This guide explains how to run your custom FLCRMLMS (Twenty CRM fork) using Docker Compose with your custom image from GitHub Container Registry.

## Quick Start

1. **Create a `.env` file** (copy from `.env.example` if available):

```bash
cp .env.example .env
```

2. **Edit `.env` and set your configuration**:

```env
# Image Configuration
TAG=latest  # or specific tag like 'main-a1b2c3d4'

# Database Configuration
PG_DATABASE_NAME=default
PG_DATABASE_USER=postgres
PG_DATABASE_PASSWORD=your_secure_password_here

# Application Configuration
SERVER_URL=http://localhost:3000
APP_SECRET=your_secure_secret_here_minimum_32_characters
APP_VERSION=0.0.0-local

# Redis (uses defaults, no config needed)
REDIS_URL=redis://redis:6379

# Optional: Disable migrations/cron if needed
# DISABLE_DB_MIGRATIONS=false
# DISABLE_CRON_JOBS_REGISTRATION=false
```

3. **Start the services**:

```bash
docker-compose up -d
```

4. **Authenticate with GitHub Container Registry** (required for private images):

```bash
# Create a GitHub Personal Access Token with 'read:packages' scope
# Go to: https://github.com/settings/tokens/new
# Select: read:packages

# Login to GHCR
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

5. **Check the logs**:

```bash
docker-compose logs -f server
```

6. **Access the application**:

Open http://localhost:3000 in your browser.

## Authentication for Private Images

### GitHub Container Registry (GHCR) Authentication

Since `ghcr.io/connorbelez/flcrmlms` is a private image, you need to authenticate:

#### Option 1: Docker Login (Recommended for local development)

```bash
# 1. Create a Personal Access Token (PAT)
#    - Go to: https://github.com/settings/tokens/new
#    - Token name: "Docker GHCR Access"
#    - Expiration: Choose based on your needs
#    - Select scopes: ✓ read:packages

# 2. Login to GHCR
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# 3. Now you can pull/run images
docker-compose pull
docker-compose up -d
```

#### Option 2: Using .docker/config.json (For CI/CD or automation)

```bash
# Create Docker config with auth
mkdir -p ~/.docker
cat > ~/.docker/config.json <<EOF
{
  "auths": {
    "ghcr.io": {
      "auth": "$(echo -n "YOUR_GITHUB_USERNAME:YOUR_GITHUB_TOKEN" | base64)"
    }
  }
}
EOF
```

#### Option 3: Environment Variable (For docker-compose)

Add to your `.env` file:

```env
GITHUB_TOKEN=your_github_token_here
```

Then login before running docker-compose:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u connorbelez --password-stdin
docker-compose up -d
```

#### Verifying Authentication

```bash
# Test if you can pull the image
docker pull ghcr.io/connorbelez/flcrmlms:latest

# If successful, you're authenticated!
```

## Using Your Custom Image from GHCR

The `docker-compose.yml` is configured to use your custom image: `ghcr.io/connorbelez/flcrmlms:latest`

### Using a Specific Version

To use a specific version/tag:

```bash
TAG=main-abc123def docker-compose up -d
```

Or set it in your `.env` file:
```env
TAG=main-abc123def
```

### Available Tags

Your GitHub Actions workflow creates these tags:
- `latest` - Latest build from main branch
- `main-{short-sha}` - Specific commit from main branch
- `{branch-name}-{short-sha}` - Specific commit from any branch

Example:
```bash
# Use latest
docker-compose up -d

# Use specific commit
TAG=main-0ff0d57de6 docker-compose up -d
```

## Services

The stack includes:

- **server** - Main Twenty application (port 3000)
- **worker** - Background job processor
- **db** - PostgreSQL 16 database
- **redis** - Redis cache

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_SECRET` | Secret key for encryption | Min 32 characters |
| `SERVER_URL` | Public URL of your instance | `http://localhost:3000` |
| `PG_DATABASE_PASSWORD` | PostgreSQL password | Strong password |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `TAG` | `latest` | Docker image tag to use |
| `APP_VERSION` | `0.0.0-local` | Application version (semver format) |
| `PG_DATABASE_NAME` | `default` | PostgreSQL database name |
| `PG_DATABASE_USER` | `postgres` | PostgreSQL username |
| `DISABLE_DB_MIGRATIONS` | - | Set to `true` to skip migrations |
| `DISABLE_CRON_JOBS_REGISTRATION` | - | Set to `true` to skip cron jobs |

### Storage Configuration

For production, configure S3-compatible storage:

```env
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=your-bucket-name
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com
```

## Authentication (Optional)

### Google OAuth

```env
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=your-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-client-secret
AUTH_GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
AUTH_GOOGLE_APIS_CALLBACK_URL=http://localhost:3000/auth/google-apis/callback
```

### Microsoft OAuth

```env
CALENDAR_PROVIDER_MICROSOFT_ENABLED=true
MESSAGING_PROVIDER_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CLIENT_ID=your-client-id
AUTH_MICROSOFT_CLIENT_SECRET=your-client-secret
AUTH_MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback
AUTH_MICROSOFT_APIS_CALLBACK_URL=http://localhost:3000/auth/microsoft-apis/callback
```

### Email Configuration

```env
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME="Your Company"
EMAIL_SYSTEM_ADDRESS=system@yourdomain.com
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
```

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes data)
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f worker
docker-compose logs -f db
```

### Restart a service
```bash
docker-compose restart server
```

### Run migrations manually
```bash
docker-compose exec server yarn database:migrate:prod
```

### Access PostgreSQL
```bash
docker-compose exec db psql -U postgres -d default
```

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

## Updating to Latest Version

```bash
# Pull latest image
docker-compose pull

# Restart services with new image
docker-compose up -d
```

## Troubleshooting

### Health Check Failures

If the server doesn't become healthy:

```bash
# Check logs
docker-compose logs server

# Common issues:
# - Database connection failed (check PG_DATABASE_URL)
# - Redis connection failed (check REDIS_URL)
# - APP_VERSION format invalid (must be semver: x.y.z)
```

### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# Check database logs
docker-compose logs db
```

### Migration Errors

```bash
# Run migrations manually
docker-compose exec server yarn database:migrate:prod

# Or force re-run setup
docker-compose exec server yarn database:init:prod
```

### APP_VERSION Validation Error

If you see `APP_VERSION must be a valid semantic version`:

```bash
# Ensure APP_VERSION is in format: x.y.z or x.y.z-suffix
APP_VERSION=0.0.0-$(git rev-parse --short HEAD) docker-compose up -d
```

## Production Deployment

For production:

1. **Use specific image tags** instead of `latest`
2. **Set strong passwords** for `APP_SECRET` and `PG_DATABASE_PASSWORD`
3. **Configure external database** and Redis for high availability
4. **Set up S3 storage** instead of local volumes
5. **Configure proper `SERVER_URL`** with your domain
6. **Enable SSL/TLS** with a reverse proxy (nginx, Traefik, etc.)
7. **Set up backups** for PostgreSQL data
8. **Configure monitoring** and alerting

Example production `.env`:

```env
TAG=main-abc123def
SERVER_URL=https://crm.yourdomain.com
APP_SECRET=your-very-long-random-secret-at-least-32-characters
APP_VERSION=1.0.0-production
PG_DATABASE_PASSWORD=your-strong-database-password
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=your-prod-bucket
```

## Security Best Practices

### Protecting Your GitHub Token

**DO NOT commit your GitHub token to git!**

```bash
# Add to .gitignore if not already there
echo ".env" >> .gitignore
echo ".docker/config.json" >> ~/.gitignore_global

# Never commit:
# - .env files with tokens
# - Docker config files with auth
```

### Token Permissions

Your GitHub Personal Access Token only needs:
- ✓ `read:packages` - To pull images

**Do not grant additional permissions!**

### Token Rotation

For production:
1. Rotate tokens every 90 days
2. Use organization-level tokens when possible
3. Consider using GitHub Actions OIDC for CI/CD instead of PATs

## Support

For issues specific to this custom build, check:
- GitHub Actions logs: https://github.com/Connorbelez/FLCRMLMS/actions
- Custom image tags: https://github.com/Connorbelez/FLCRMLMS/pkgs/container/flcrmlms

For general Twenty CRM issues:
- Twenty Documentation: https://twenty.com/developers
- Twenty GitHub: https://github.com/twentyhq/twenty

## Quick Reference: Authentication Errors

If you see errors like:
```
Error response from daemon: pull access denied for ghcr.io/connorbelez/flcrmlms
```

**Solution:**
1. Verify you're logged in: `docker login ghcr.io`
2. Check token has `read:packages` scope
3. Verify token hasn't expired
4. Ensure you have access to the repository