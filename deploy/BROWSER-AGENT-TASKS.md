# Controlit CRM Deployment - Browser Agent Tasks

## Overview

This document contains all tasks for the browser agent to deploy Controlit CRM on Hostinger VPS.

**VPS Info:**
- Hostname: `srv1227475.hstgr.cloud`
- OS: Ubuntu 24.04 LTS
- Plan: KVM 2 (8GB RAM, 2 vCPU)
- Root Password: (obtain from Hostinger panel)

**Target URL:** `https://crm.controlitfactory.eu`

**Note:** Email setup will be done separately by account owner.

---

## TASK 1: Get VPS IP Address

### Objective
Retrieve the VPS IP address from Hostinger hPanel

### Steps
1. Go to https://hpanel.hostinger.com
2. Click **VPS** in the left sidebar
3. Click on **srv1227475.hstgr.cloud**
4. Look for **IP Address** in the VPS details/overview section
5. Copy the IP address

### Return Information
```
VPS IP Address: _______________
```

---

## TASK 2: Configure DNS Record

### Objective
Create DNS A record pointing crm.controlitfactory.eu to VPS IP

### Prerequisites
- VPS IP address from Task 1

### Steps
1. Go to https://hpanel.hostinger.com
2. Click **Domains** in the left sidebar
3. Click on **controlitfactory.eu**
4. Click **DNS / Nameservers** → **Manage DNS Records**
5. Click **Add Record**
6. Fill in:
   - **Type:** A
   - **Name:** crm
   - **Points to:** [VPS_IP_ADDRESS from Task 1]
   - **TTL:** 14400 (or leave default)
7. Click **Add Record** / **Save**

### Verify
After 5 minutes, the record should propagate. You can verify at https://dnschecker.org by checking `crm.controlitfactory.eu`

### Return Information
```
DNS Record Added: Yes/No
Name: crm
Points to: [IP]
```

---

## TASK 3: Server Setup via Browser Terminal

### Objective
Install Docker, Nginx, and prepare server for CRM deployment

### Steps
1. Go to https://hpanel.hostinger.com
2. Click **VPS** → **srv1227475.hstgr.cloud**
3. Click **Browser terminal** (or **Terminal** / **Console**)
4. Login as `root` (use password from Hostinger panel)

5. Run these commands ONE BY ONE (wait for each to complete):

```bash
# Step 1: Update system
apt update && apt upgrade -y
```

```bash
# Step 2: Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh
```

```bash
# Step 3: Install Docker Compose plugin
apt install -y docker-compose-plugin
```

```bash
# Step 4: Install Nginx and Certbot
apt install -y nginx certbot python3-certbot-nginx
```

```bash
# Step 5: Configure firewall
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable
```

```bash
# Step 6: Create app directory
mkdir -p /opt/controlit-crm
```

```bash
# Step 7: Verify Docker is working
docker --version && docker compose version
```

### Return Information
```
Docker Version: _______________
Docker Compose Version: _______________
Setup Complete: Yes/No
Any Errors: _______________
```

---

## TASK 4: Deploy Controlit CRM

### Objective
Create configuration files and start CRM containers

### Prerequisites
- Task 3 completed successfully

### Steps
1. Open Browser Terminal (same as Task 3)

2. Create docker-compose file:
```bash
cat > /opt/controlit-crm/docker-compose.yml << 'DOCKEREOF'
name: controlit-crm

services:
  server:
    image: twentycrm/twenty:latest
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    ports:
      - "3000:3000"
    environment:
      NODE_PORT: 3000
      NODE_ENV: production
      PG_DATABASE_URL: postgres://controlit_user:Contr0lit_CRM_2024_Secure@db:5432/default
      SERVER_URL: https://crm.controlitfactory.eu
      REDIS_URL: redis://redis:6379
      APP_SECRET: cF7kP9mN2xQ4vR8tY6wZ3aB5dE1gH0jL
      STORAGE_TYPE: local
      AUTH_PASSWORD_ENABLED: "true"
      IS_EMAIL_VERIFICATION_REQUIRED: "false"
      EMAIL_DRIVER: logger
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: curl --fail http://localhost:3000/healthz
      interval: 5s
      timeout: 5s
      retries: 20
    restart: always

  worker:
    image: twentycrm/twenty:latest
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    command: ["yarn", "worker:prod"]
    environment:
      NODE_ENV: production
      PG_DATABASE_URL: postgres://controlit_user:Contr0lit_CRM_2024_Secure@db:5432/default
      SERVER_URL: https://crm.controlitfactory.eu
      REDIS_URL: redis://redis:6379
      DISABLE_DB_MIGRATIONS: "true"
      DISABLE_CRON_JOBS_REGISTRATION: "true"
      APP_SECRET: cF7kP9mN2xQ4vR8tY6wZ3aB5dE1gH0jL
      STORAGE_TYPE: local
      EMAIL_DRIVER: logger
    depends_on:
      db:
        condition: service_healthy
      server:
        condition: service_healthy
    restart: always

  db:
    image: postgres:16
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: default
      POSTGRES_PASSWORD: Contr0lit_CRM_2024_Secure
      POSTGRES_USER: controlit_user
    healthcheck:
      test: pg_isready -U controlit_user -h localhost -d postgres
      interval: 5s
      timeout: 5s
      retries: 10
    restart: always

  redis:
    image: redis:7-alpine
    restart: always
    command: ["--maxmemory-policy", "noeviction"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  db-data:
  server-local-data:
DOCKEREOF
```

3. Start the containers (this will take 5-10 minutes on first run):
```bash
cd /opt/controlit-crm && docker compose up -d
```

4. Wait 2 minutes, then check if all containers are running:
```bash
docker compose ps
```

5. Check server health:
```bash
curl -s http://localhost:3000/healthz
```

### Expected Output
- 4 containers running: server, worker, db, redis
- Health check returns: `{"status":"ok"}` or similar

### Return Information
```
Containers Running:
- controlit-crm-server-1: Running/Error
- controlit-crm-worker-1: Running/Error
- controlit-crm-db-1: Running/Error
- controlit-crm-redis-1: Running/Error

Health Check Response: _______________
```

---

## TASK 5: Configure Nginx Reverse Proxy

### Objective
Set up Nginx to proxy requests to the CRM

### Prerequisites
- Task 4 completed, all containers running

### Steps
1. Open Browser Terminal

2. Create Nginx configuration:
```bash
cat > /etc/nginx/sites-available/controlit-crm << 'NGINXEOF'
server {
    listen 80;
    server_name crm.controlitfactory.eu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        client_max_body_size 50M;
    }
}
NGINXEOF
```

3. Enable the site:
```bash
ln -sf /etc/nginx/sites-available/controlit-crm /etc/nginx/sites-enabled/
```

4. Remove default site:
```bash
rm -f /etc/nginx/sites-enabled/default
```

5. Test Nginx configuration:
```bash
nginx -t
```

6. Reload Nginx:
```bash
systemctl reload nginx
```

### Return Information
```
Nginx Config Test: OK/Error
Nginx Reload: Success/Error
```

---

## TASK 6: Set Up SSL Certificate

### Objective
Install Let's Encrypt SSL certificate for HTTPS

### Prerequisites
- Task 5 completed
- DNS propagated (crm.controlitfactory.eu resolves to VPS IP)

### Steps
1. Open Browser Terminal

2. Run Certbot:
```bash
certbot --nginx -d crm.controlitfactory.eu --non-interactive --agree-tos -m info@controlitfactory.eu
```

3. Verify SSL is working:
```bash
curl -I https://crm.controlitfactory.eu
```

### Return Information
```
SSL Certificate Installed: Yes/No
HTTPS Test Response Code: _______________
Any Errors: _______________
```

---

## TASK 7: Verify Deployment

### Objective
Confirm CRM is accessible and working

### Steps
1. Open a new browser tab
2. Navigate to: https://crm.controlitfactory.eu
3. You should see the Controlit CRM login/signup page
4. Take a screenshot of the page

### Expected Result
- Page loads without errors
- Shows login or registration form
- Title shows "Controlit CRM"
- Gold/amber accent colors visible

### Return Information
```
CRM Accessible: Yes/No
Page Title: _______________
Login Form Visible: Yes/No
Screenshot: [attached]
```

---

## TROUBLESHOOTING

### If containers won't start:
```bash
cd /opt/controlit-crm
docker compose logs
```

### If Nginx fails:
```bash
nginx -t
journalctl -u nginx --no-pager -n 50
```

### If SSL fails:
```bash
# Check if DNS is propagated first
dig crm.controlitfactory.eu

# Try certbot in standalone mode
systemctl stop nginx
certbot certonly --standalone -d crm.controlitfactory.eu
systemctl start nginx
```

### To restart everything:
```bash
cd /opt/controlit-crm
docker compose restart
systemctl restart nginx
```

---

## POST-DEPLOYMENT

After deployment is verified:

1. **Create Admin Account**
   - Go to https://crm.controlitfactory.eu
   - Click "Sign up"
   - Create the first user (will be admin)

2. **Email Setup** (Done by account owner)
   - Update docker-compose.yml with SMTP settings
   - Restart containers: `docker compose restart`

3. **Backup Setup** (Optional)
   - Database backups
   - Local storage backups
