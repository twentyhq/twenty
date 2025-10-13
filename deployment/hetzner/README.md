# Twenty CRM - Hetzner VPS Deployment Guide

Complete production deployment guide for Twenty CRM on Hetzner Cloud (Oregon datacenter).

## Overview

- **Server**: Hetzner CPX21 (4GB RAM, 3 vCPU, 80GB NVMe SSD)
- **Location**: Hillsboro, Oregon, USA
- **OS**: Ubuntu 24.04 LTS
- **Monthly Cost**: €4.99 (~$5.30 USD)
- **Architecture**: Docker Compose with Nginx reverse proxy
- **SSL**: Let's Encrypt (free, auto-renewal)

## Prerequisites

- Domain name pointed to your server IP
- Hetzner Cloud account
- SSH client
- Basic Linux command line knowledge

## Quick Start

```bash
# 1. Create server on Hetzner
# 2. SSH into server
ssh root@YOUR_SERVER_IP

# 3. Download and run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/deployment/hetzner/scripts/setup-server.sh | bash

# 4. Clone your repository
git clone https://github.com/YOUR_ORG/twenty.git
cd twenty/deployment/hetzner

# 5. Configure environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# 6. Deploy
./scripts/deploy.sh

# 7. Setup SSL
./scripts/ssl-setup.sh YOUR_DOMAIN.com YOUR_EMAIL@example.com
```

## Detailed Setup Instructions

### Step 1: Create Hetzner Server

1. **Login to Hetzner Cloud Console**
   - Go to https://console.hetzner.cloud/
   - Create a new project (e.g., "Twenty CRM Production")

2. **Create Server**
   - Click "Add Server"
   - **Location**: Hillsboro, OR, USA (us-west)
   - **Image**: Ubuntu 24.04
   - **Type**: CPX21 (€4.99/month)
     - 3 vCPU (AMD)
     - 4 GB RAM
     - 80 GB NVMe SSD
     - 20 TB traffic
   - **SSH Key**: Add your SSH public key
     ```bash
     # Generate if you don't have one
     ssh-keygen -t ed25519 -C "your_email@example.com"
     cat ~/.ssh/id_ed25519.pub  # Copy this to Hetzner
     ```
   - **Firewall**: We'll configure this later
   - Click "Create & Buy now"

3. **Note Your Server IP**
   - Copy the IPv4 address (e.g., 123.45.67.89)

### Step 2: Configure Domain DNS

Point your domain to the server:

```
A Record:  @     -> YOUR_SERVER_IP
A Record:  www   -> YOUR_SERVER_IP
```

Wait 5-10 minutes for DNS propagation.

### Step 3: Initial Server Setup

SSH into your server:

```bash
ssh root@YOUR_SERVER_IP
```

Run the automated setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/timberline-tech/twenty/main/deployment/hetzner/scripts/setup-server.sh -o setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

This script will:
- ✅ Update system packages
- ✅ Install Docker and Docker Compose
- ✅ Configure UFW firewall (ports 22, 80, 443)
- ✅ Install fail2ban for SSH protection
- ✅ Set up swap space (4GB)
- ✅ Configure timezone
- ✅ Install monitoring tools

### Step 4: Clone and Configure

```bash
# Clone the repository
git clone https://github.com/timberline-tech/twenty.git
cd twenty/deployment/hetzner

# Copy and configure environment
cp .env.production.example .env.production
nano .env.production
```

**Required Environment Variables:**

```bash
# Domain Configuration
DOMAIN=your-domain.com
SERVER_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Security
APP_SECRET=<generate with: openssl rand -hex 32>

# Database
PG_DATABASE_USER=twenty
PG_DATABASE_PASSWORD=<generate strong password>

# Email (optional but recommended)
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME=Twenty CRM

# Storage (optional - defaults to local)
STORAGE_TYPE=local
# OR use S3-compatible (Cloudflare R2, AWS S3, etc.)
# STORAGE_TYPE=s3
# STORAGE_S3_REGION=auto
# STORAGE_S3_NAME=your-bucket-name
# STORAGE_S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

### Step 5: Deploy Application

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy
./scripts/deploy.sh
```

This will:
- Build and start all containers
- Run database migrations
- Set up health checks
- Configure restart policies

Verify services are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see:
- twenty-server (healthy)
- twenty-worker (healthy)
- twenty-db (healthy)
- twenty-redis (running)

### Step 6: Configure Nginx and SSL

```bash
# Install Nginx
apt install -y nginx

# Copy Nginx configuration
cp nginx/twenty.conf /etc/nginx/sites-available/twenty
ln -s /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/

# Update domain in config
sed -i 's/your-domain.com/YOUR_ACTUAL_DOMAIN/g' /etc/nginx/sites-available/twenty

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

Set up SSL certificate:

```bash
./scripts/ssl-setup.sh your-domain.com your-email@example.com
```

This will:
- Install Certbot
- Obtain Let's Encrypt certificate
- Configure auto-renewal
- Update Nginx for HTTPS

### Step 7: Verify Deployment

1. **Check Services**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. **Check Logs**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f server
   ```

3. **Test Application**
   - Open https://your-domain.com
   - You should see the Twenty login page
   - Create an account and test functionality

4. **Check SSL**
   ```bash
   curl -I https://your-domain.com
   # Should return 200 OK with HTTPS
   ```

## Maintenance

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f worker
docker compose -f docker-compose.prod.yml logs -f db
```

### Updating Twenty

```bash
cd /root/twenty/deployment/hetzner

# Pull latest code
git pull origin main

# Backup database first!
./scripts/backup-database.sh

# Redeploy
./scripts/deploy.sh
```

### Database Backups

**Manual Backup:**
```bash
./scripts/backup-database.sh
```

**Automated Daily Backups (Cron):**
```bash
# Add to crontab
crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * /root/twenty/deployment/hetzner/scripts/backup-database.sh
```

Backups are stored in `/root/twenty-backups/` with 7-day rotation.

**Restore from Backup:**
```bash
# Stop the application
docker compose -f docker-compose.prod.yml down

# Restore database
docker run --rm -v twenty_db-data:/var/lib/postgresql/data \
  -v /root/twenty-backups:/backups postgres:16 \
  bash -c "cd /var/lib/postgresql/data && rm -rf * && \
  gunzip -c /backups/twenty-db-YYYY-MM-DD-HHMMSS.sql.gz | \
  psql -U postgres"

# Start the application
docker compose -f docker-compose.prod.yml up -d
```

### Monitoring

Run the monitoring script:

```bash
./scripts/monitor.sh
```

This checks:
- Disk space usage
- Container health status
- Memory usage
- Service availability

Set up automated monitoring (every 5 minutes):
```bash
crontab -e

# Add this line
*/5 * * * * /root/twenty/deployment/hetzner/scripts/monitor.sh
```

### Resource Usage

Check system resources:

```bash
# Overall system
htop

# Docker resources
docker stats

# Disk usage
df -h
du -sh /var/lib/docker
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs server

# Check environment variables
cat .env.production

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Database Connection Issues

```bash
# Check database is running
docker compose -f docker-compose.prod.yml ps db

# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Test connection
docker compose -f docker-compose.prod.yml exec db psql -U twenty -d default
```

### Out of Memory

```bash
# Check memory
free -h

# Check swap
swapon --show

# Restart services to free memory
docker compose -f docker-compose.prod.yml restart
```

### SSL Certificate Issues

```bash
# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal

# Check certificate
certbot certificates
```

### Application Not Accessible

```bash
# Check Nginx
systemctl status nginx
nginx -t

# Check firewall
ufw status

# Check Docker containers
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs server
journalctl -u nginx -f
```

## Security Best Practices

1. **Regular Updates**
   ```bash
   apt update && apt upgrade -y
   ```

2. **Monitor fail2ban**
   ```bash
   fail2ban-client status sshd
   ```

3. **Review Logs**
   ```bash
   tail -f /var/log/auth.log
   ```

4. **Backup Regularly**
   - Set up automated daily backups
   - Test restore procedure monthly
   - Store backups off-site (S3, Backblaze B2)

5. **Keep Docker Images Updated**
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

## Performance Optimization

### Enable Redis Persistence

Edit `docker-compose.prod.yml`:

```yaml
redis:
  volumes:
    - redis-data:/data
  command: ["redis-server", "--appendonly", "yes"]

volumes:
  redis-data:
```

### PostgreSQL Tuning

For 4GB RAM server, add to `docker-compose.prod.yml`:

```yaml
db:
  environment:
    POSTGRES_SHARED_BUFFERS: "1GB"
    POSTGRES_EFFECTIVE_CACHE_SIZE: "3GB"
    POSTGRES_MAINTENANCE_WORK_MEM: "256MB"
    POSTGRES_WORK_MEM: "4MB"
```

### Nginx Caching

Already configured in `nginx/twenty.conf` for static assets.

## Cost Breakdown

- **Hetzner CPX21**: €4.99/month ($5.30/month)
- **Domain**: ~$12/year ($1/month)
- **SSL Certificate**: FREE (Let's Encrypt)
- **Email (SendGrid)**: FREE tier (100 emails/day)
- **Backups**: FREE (on same server) or ~$2/month (external storage)

**Total: ~$6-8/month**

## Scaling

When you need more resources:

1. **Vertical Scaling** (Upgrade server)
   - Hetzner CPX31: €8.99/month (8GB RAM, 4 vCPU)
   - Hetzner CPX41: €15.99/month (16GB RAM, 8 vCPU)

2. **Horizontal Scaling** (Multiple servers)
   - Separate database server
   - Load balancer
   - Multiple application servers

## Support

- **Twenty Documentation**: https://twenty.com/developers
- **GitHub Issues**: https://github.com/timberline-tech/twenty/issues
- **Community Discord**: https://twenty.com/discord
- **Hetzner Support**: https://docs.hetzner.com/

## License

This deployment configuration is part of the Twenty CRM project and is licensed under AGPL-3.0.
