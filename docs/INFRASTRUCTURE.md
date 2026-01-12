# Twenty CRM Infrastructure Documentation

## Overview
Complete production-ready infrastructure setup for Twenty CRM with automated backups, HTTPS/SSL, S3 storage, email configuration, and Nginx reverse proxy.

## Architecture

```
┌─────────────────────────────────────────────┐
│     Browser (https://localhost:3443)        │
└─────────────────┬───────────────────────────┘
                  │ HTTPS (3443)
                  ▼
┌─────────────────────────────────────────────┐
│            Nginx Reverse Proxy               │
│  - SSL Termination                          │
│  - Rate Limiting                            │
│  - Security Headers                         │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│          Twenty Server (Port 3000)          │
│  - Web Application                          │
│  - API Endpoints                            │
│  - S3 Storage Integration                   │
│  - SMTP Email                               │
└───────┬─────────────────────────┬───────────┘
        │                         │
        ▼                         ▼
┌──────────────┐         ┌─────────────────┐
│ PostgreSQL   │         │ Redis Cache     │
│ Database     │         │                 │
└──────┬───────┘         └─────────────────┘
       │
       │ Daily Backup
       ▼
┌────────────────────┐
│ Desktop/Backups    │
│ (30-day retention) │
└────────────────────┘
```

## Components

### 1. Web Server (Nginx)
- **Container:** twenty-nginx
- **Ports:** 3080 (HTTP), 3443 (HTTPS)
- **Features:**
  - SSL/TLS termination
  - HTTP to HTTPS redirect
  - Rate limiting (10 req/s)
  - Security headers
  - Reverse proxy to Twenty server
- **Config:** `nginx/nginx.conf`
- **Docs:** [SSL-SETUP.md](SSL-SETUP.md)

### 2. Application Server
- **Container:** twenty-server-1
- **Internal Port:** 3000
- **Features:**
  - Next.js/React frontend
  - Node.js backend API
  - S3 file storage
  - SMTP email integration
- **Config:** `.env`

### 3. Database
- **Container:** twenty-db-1
- **Image:** postgres:16
- **Port:** 5432 (internal)
- **Features:**
  - PostgreSQL 16
  - Automated daily backups
  - Health checks
- **Backup:** Automated via Task Scheduler

### 4. Cache
- **Container:** twenty-redis-1
- **Image:** redis:latest
- **Port:** 6379 (internal)
- **Purpose:** Session storage, caching

### 5. Background Worker
- **Container:** twenty-worker-1
- **Features:**
  - Async job processing
  - Scheduled tasks
  - Email queue

## Storage

### S3 Configuration
- **Type:** AWS S3 or S3-compatible (MinIO)
- **Purpose:** File uploads, attachments, avatars
- **Config:** See [S3-STORAGE.md](S3-STORAGE.md)
- **Buckets:** Configured in `STORAGE_S3_NAME`

### Database Backups
- **Location:** `%USERPROFILE%\Desktop\twenty-backups`
- **Format:** Compressed SQL (gzip)
- **Schedule:**
  - On user login
  - Daily at 2:00 AM
- **Retention:** 30 days
- **Docs:** [BACKUP-SETUP.md](BACKUP-SETUP.md)

## Email

### SMTP Configuration
- **Purpose:** Notifications, password resets, invitations
- **Supported Providers:**
  - Gmail (with app password)
  - SendGrid
  - Mailgun
  - AWS SES
  - Any SMTP server
- **Config:** See [EMAIL-SETUP.md](EMAIL-SETUP.md)

## Security

### SSL/TLS
- **Certificate Type:** Self-signed (development)
- **Protocol:** TLS 1.2, TLS 1.3
- **Key Size:** RSA 2048-bit
- **Validity:** 365 days
- **Renewal:** `./nginx/ssl/generate-certs.sh`

### Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

### Rate Limiting
- **Limit:** 10 requests/second per IP
- **Burst:** 20 requests
- **Protection:** DDoS mitigation

### Secrets Management
- **File:** `.env` (gitignored)
- **Credentials:**
  - APP_SECRET (random 32-byte)
  - PG_DATABASE_PASSWORD
  - AWS_ACCESS_KEY_ID / SECRET
  - EMAIL_SMTP_PASSWORD

## Monitoring & Health Checks

### Health Check Script
```bash
./scripts/health-check.sh
```

Checks:
- ✓ Container status
- ✓ HTTPS accessibility
- ✓ HTTP redirect
- ✓ Backup system
- ✓ SSL certificates
- ✓ Storage configuration
- ✓ Email configuration
- ✓ Environment variables

### Container Health
```bash
docker compose ps
```

### Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f server
docker compose logs -f nginx
docker compose logs -f db
```

## Maintenance

### Start Services
```bash
docker compose up -d
```

### Stop Services
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### Update Twenty
```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

### Backup Now
```bash
./scripts/backup-database.sh
```

### Restore Backup
```bash
# Stop application
docker compose stop twenty-server twenty-worker

# Restore
gunzip -c ~/Desktop/twenty-backups/twenty_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i twenty-db-1 psql -U postgres default

# Restart
docker compose up -d
```

## File Structure

```
crm-twenty/
├── .env                          # Environment configuration
├── docker-compose.yml            # Main Docker config
├── docker-compose.override.yml   # Nginx override
├── nginx/
│   ├── nginx.conf               # Nginx configuration
│   └── ssl/
│       ├── twenty.crt           # SSL certificate
│       ├── twenty.key           # SSL private key
│       └── generate-certs.sh    # Certificate generator
├── scripts/
│   ├── backup-database.sh       # Backup script
│   ├── setup-backup-task.ps1    # Windows scheduler
│   ├── test-s3-connection.sh    # S3 test
│   ├── test-email.sh            # Email test
│   └── health-check.sh          # Health check
└── docs/
    ├── INFRASTRUCTURE.md        # This file
    ├── BACKUP-SETUP.md          # Backup docs
    ├── SSL-SETUP.md             # SSL docs
    ├── S3-STORAGE.md            # S3 docs
    └── EMAIL-SETUP.md           # Email docs
```

## Troubleshooting

### Application Not Accessible
```bash
# Check all containers
docker compose ps

# Check Nginx logs
docker compose logs nginx

# Test direct access (bypass Nginx)
curl http://localhost:3000
```

### Database Connection Issues
```bash
# Check database container
docker compose ps db

# Test connection
docker exec twenty-db-1 psql -U postgres -c "SELECT 1"
```

### Backup Failures
```bash
# Check script permissions
ls -l scripts/backup-database.sh

# Run manually
./scripts/backup-database.sh

# Check scheduled task
powershell Get-ScheduledTask -TaskName "TwentyCRM-DailyBackup"
```

### SSL Certificate Errors
```bash
# Regenerate certificates
./nginx/ssl/generate-certs.sh

# Restart Nginx
docker compose restart nginx

# Verify certificate
openssl x509 -text -noout -in nginx/ssl/twenty.crt
```

## Production Deployment

For production environments:

1. **Use real SSL certificates** (Let's Encrypt)
2. **Configure proper domain** in SERVER_URL
3. **Use managed database** (RDS, Cloud SQL)
4. **Enable S3 versioning** and lifecycle policies
5. **Use IAM roles** instead of access keys
6. **Configure CDN** (CloudFront, Cloudflare)
7. **Set up monitoring** (Datadog, New Relic)
8. **Enable logging** (CloudWatch, ELK stack)
9. **Implement backup rotation** to S3
10. **Use secrets manager** (AWS Secrets Manager, Vault)

## Support

- **Documentation:** Check individual docs in `docs/`
- **Health Check:** `./scripts/health-check.sh`
- **Logs:** `docker compose logs -f`
- **Twenty Docs:** https://twenty.com/developers
