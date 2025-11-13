# Docker Quick Start Guide

Get FLCRMLMS (Twenty CRM) running with Docker in 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- GitHub account with access to this repository
- GitHub Personal Access Token with `read:packages` scope

## Quick Start

### 1. Authenticate with GitHub Container Registry

Run the setup script to authenticate:

```bash
cd packages/twenty-docker
./setup-ghcr-auth.sh
```

Or manually:

```bash
# Create a token at: https://github.com/settings/tokens/new (select 'read:packages')
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 2. Configure Environment

```bash
cd packages/twenty-docker
cp .env.template .env
```

Edit `.env` and update at minimum:

```env
# Generate a secure secret: openssl rand -base64 32
APP_SECRET=your_secure_secret_here_minimum_32_characters

# Set your desired database password
PG_DATABASE_PASSWORD=your_secure_password_here
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Access Application

Open http://localhost:3000 in your browser.

### 5. Check Logs

```bash
docker-compose logs -f server
```

## What's Running?

- **Server** (port 3000) - Main application
- **Worker** - Background job processor  
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Cache

## Common Commands

```bash
# Stop services
docker-compose down

# Restart a service
docker-compose restart server

# View logs
docker-compose logs -f

# Update to latest image
docker-compose pull && docker-compose up -d

# Run migrations manually
docker-compose exec server yarn database:migrate:prod

# Access database
docker-compose exec db psql -U postgres -d default
```

## Using Specific Image Versions

```bash
# Use a specific commit
TAG=main-abc123def docker-compose up -d

# Or set in .env
echo "TAG=main-abc123def" >> .env
docker-compose up -d
```

Available tags:
- `latest` - Latest build from main
- `main-{sha}` - Specific commit
- `{branch}-{sha}` - From any branch

## Troubleshooting

### Can't Pull Image

```bash
# Verify authentication
docker pull ghcr.io/connorbelez/flcrmlms:latest

# If it fails, re-authenticate
docker login ghcr.io
```

### Health Check Fails

```bash
# Check logs
docker-compose logs server

# Common issues:
# - Wrong APP_SECRET format (needs 32+ characters)
# - Database connection failed
# - APP_VERSION invalid (must be semver: x.y.z)
```

### APP_VERSION Error

Ensure `APP_VERSION` in `.env` is valid semver:

```env
APP_VERSION=0.0.0-local
```

### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# View database logs
docker-compose logs db
```

## Production Deployment

For production use:

1. **Use specific image tags** (not `latest`)
2. **Set strong passwords** for `APP_SECRET` and database
3. **Configure external PostgreSQL** for high availability
4. **Set up S3 storage** instead of local volumes
5. **Use proper `SERVER_URL`** with your domain
6. **Enable SSL/TLS** with reverse proxy
7. **Set up backups** for database

See `packages/twenty-docker/README-CUSTOM.md` for detailed production setup.

## Security Notes

⚠️ **Never commit these files:**
- `.env` - Contains secrets
- `.docker/config.json` - Contains auth tokens

✅ **Always:**
- Use strong passwords (32+ characters for APP_SECRET)
- Rotate tokens regularly
- Use minimal token scopes (`read:packages` only)
- Keep Docker and dependencies updated

## More Information

- **Detailed Guide**: `packages/twenty-docker/README-CUSTOM.md`
- **GitHub Actions**: View builds at https://github.com/Connorbelez/FLCRMLMS/actions
- **Image Registry**: https://github.com/Connorbelez/FLCRMLMS/pkgs/container/flcrmlms
- **Twenty Docs**: https://twenty.com/developers

## Getting Help

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify authentication: `docker login ghcr.io`
3. Review GitHub Actions for build failures
4. Check image is available: `docker pull ghcr.io/connorbelez/flcrmlms:latest`

## Next Steps

Once running:

1. Create your first workspace
2. Configure email/OAuth integrations (optional)
3. Set up S3 storage for production
4. Configure domain and SSL
5. Set up monitoring and backups

Enjoy using FLCRMLMS! 🚀