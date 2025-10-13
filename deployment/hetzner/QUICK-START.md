# Twenty CRM - Hetzner Quick Start

## Prerequisites
- Hetzner account
- Domain name
- SSH key pair

## Step-by-Step Deployment

### 1. Create Hetzner Server (5 minutes)

1. Go to https://console.hetzner.cloud/
2. Create new project: "Twenty CRM Production"
3. **Add Server:**
   - Location: **Hillsboro, OR, USA** (us-west)
   - Image: **Ubuntu 24.04**
   - Type: **CPX21** (€4.99/month - 4GB RAM, 3 vCPU)
   - Add your SSH key
   - Click "Create & Buy now"
4. Copy the server IP address

### 2. Configure DNS (5-10 minutes)

Add these DNS records to your domain:
```
A Record:  @     -> YOUR_SERVER_IP
A Record:  www   -> YOUR_SERVER_IP
```

Wait 5-10 minutes for DNS propagation.

### 3. Initial Server Setup (10 minutes)

SSH into your server:
```bash
ssh root@YOUR_SERVER_IP
```

Run the setup script:
```bash
curl -fsSL https://raw.githubusercontent.com/timberline-tech/twenty/main/deployment/hetzner/scripts/setup-server.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

This installs: Docker, Nginx, UFW firewall, fail2ban, swap space

### 4. Clone Repository (2 minutes)

```bash
git clone https://github.com/timberline-tech/twenty.git
cd twenty/deployment/hetzner
```

### 5. Configure Environment (5 minutes)

```bash
cp .env.production.example .env.production
nano .env.production
```

**Minimum required configuration:**
```bash
# Domain
DOMAIN=your-domain.com
SERVER_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Security (generate with: openssl rand -hex 32)
APP_SECRET=YOUR_GENERATED_SECRET

# Database (generate with: openssl rand -base64 32)
PG_DATABASE_PASSWORD=YOUR_GENERATED_PASSWORD

# Email (optional but recommended)
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
```

**Generate secrets:**
```bash
echo "APP_SECRET=$(openssl rand -hex 32)"
echo "PG_DATABASE_PASSWORD=$(openssl rand -base64 32)"
```

### 6. Deploy Application (5 minutes)

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

This will:
- Pull Docker images
- Start all containers (database, Redis, server, worker)
- Run database migrations
- Configure health checks

### 7. Configure Nginx & SSL (5 minutes)

Install Nginx:
```bash
apt install -y nginx
cp nginx/twenty.conf /etc/nginx/sites-available/twenty
ln -s /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/
sed -i 's/your-domain.com/YOUR_ACTUAL_DOMAIN/g' /etc/nginx/sites-available/twenty
nginx -t
systemctl restart nginx
```

Setup SSL certificate:
```bash
./scripts/ssl-setup.sh your-domain.com your-email@example.com
```

### 8. Verify Deployment

Open your browser and go to:
```
https://your-domain.com
```

You should see the Twenty CRM login page.

### 9. Set Up Automated Backups (2 minutes)

```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * /root/twenty/deployment/hetzner/scripts/backup-database.sh
```

## Total Time: ~30-45 minutes

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker compose -f docker-compose.prod.yml logs -f server

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop all services
docker compose -f docker-compose.prod.yml down

# Update to latest version
cd /root/twenty
git pull origin main
cd deployment/hetzner
./scripts/deploy.sh

# Create manual backup
./scripts/backup-database.sh

# Monitor system health
./scripts/monitor.sh
```

## Cost Breakdown

- **Hetzner CPX21**: €4.99/month (~$5.30/month)
- **Domain**: ~$12/year (~$1/month)
- **SSL Certificate**: FREE (Let's Encrypt)
- **Email (SendGrid)**: FREE tier (100 emails/day)

**Total: ~$6-7/month**

## Troubleshooting

### Application not accessible
```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs server

# Check Nginx
systemctl status nginx
nginx -t

# Check firewall
ufw status
```

### Out of memory
```bash
# Check memory
free -h

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### SSL issues
```bash
# Check certificate
certbot certificates

# Renew certificate
certbot renew --force-renewal
```

## Next Steps

1. **Create your first account** at https://your-domain.com
2. **Configure email integration** (Gmail, Microsoft)
3. **Set up backups to external storage** (S3, Backblaze B2)
4. **Configure monitoring alerts**
5. **Review security settings**

## Support

- **Documentation**: https://twenty.com/developers
- **GitHub**: https://github.com/timberline-tech/twenty/issues
- **Discord**: https://twenty.com/discord

## Security Notes

- ✅ Firewall (UFW) configured - only ports 22, 80, 443 open
- ✅ fail2ban protecting SSH
- ✅ SSL/TLS encryption enabled
- ✅ Database not exposed to internet
- ✅ Redis not exposed to internet
- ✅ Docker containers isolated on private network

Remember to:
- Keep your server updated: `apt update && apt upgrade -y`
- Monitor disk space and backups
- Rotate logs regularly (configured automatically)
- Test backup restoration monthly
