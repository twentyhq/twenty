# Controlit CRM Release Plan

## Executive Summary

This document outlines the complete plan to deploy and customize the Twenty CRM open-source system for **Controlit Factory** (controlitfactory.eu), a leak prevention solutions company based in Riga, Latvia.

**Company Profile:**
- Industry: Waterproofing & Leak Detection Technology
- Founded: 2016
- Location: Jaunmoku iela 34, Riga, LV-1046
- Contact: +371 2 7007494 | Info@controlitfactory.eu
- Tagline: "We Make Waterproofing Testable"

---

## Part 0: Repository & Fork Management

### 0.1 Repository Structure

This project is a **fork** of the open-source Twenty CRM, allowing Controlit to:
- Receive upstream security updates and bug fixes
- Maintain custom branding and features
- Keep a clean separation between upstream and customizations

**Repository Setup:**
```
Upstream:  github.com/twentyhq/twenty      (original Twenty CRM)
Origin:    github.com/akruminsh/controlit-crm  (your fork)
```

### 0.2 Branching Strategy

```
upstream/main ────────────────────────────→ (Twenty CRM updates)
                     ↓ periodic merge
origin/main ─────────●────────────────────→ (synced with upstream)
                     ↓ branch
controlit-main ──────●─────●─────●────────→ (Controlit production)
                     ↑     ↑     ↑
               branding  config  features
```

**Branches:**
| Branch | Purpose |
|--------|---------|
| `main` | Synced with upstream Twenty CRM |
| `controlit-main` | Controlit production branch |
| `feature/*` | New features for Controlit |
| `fix/*` | Bug fixes |

### 0.3 Initial Setup Commands

Run these commands to set up the fork properly:

```bash
# 1. Add upstream remote (already done)
git remote add upstream https://github.com/twentyhq/twenty.git

# 2. Create controlit-main branch from main
git checkout main
git checkout -b controlit-main

# 3. Push controlit-main to origin
git push -u origin controlit-main

# 4. Set controlit-main as default branch in GitHub settings
```

### 0.4 Syncing with Upstream (When Needed)

To pull updates from Twenty CRM:

```bash
# Fetch upstream changes
git fetch upstream

# Merge into main
git checkout main
git merge upstream/main
git push origin main

# Merge into controlit-main (resolve conflicts if any)
git checkout controlit-main
git merge main
git push origin controlit-main
```

### 0.5 Making Controlit Customizations

All customizations should be made on `controlit-main` or feature branches:

```bash
# For new features
git checkout controlit-main
git checkout -b feature/branding-update
# ... make changes ...
git commit -m "Update branding colors"
git push origin feature/branding-update
# Create PR to controlit-main
```

---

## Part 1: Technical Architecture Overview

### 1.1 System Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React 18 + Vite | User interface |
| Backend | NestJS + GraphQL | API & business logic |
| Database | PostgreSQL 16 | Data persistence |
| Cache | Redis | Sessions, caching, job queue |
| Worker | BullMQ | Background job processing |
| Email | Nodemailer/SMTP | Transactional emails |

### 1.2 Infrastructure Requirements

**Minimum VPS Specifications (Hostinger KVM 2 recommended):**
- CPU: 2 vCores
- RAM: 8GB (minimum 4GB)
- Storage: 100GB NVMe SSD
- OS: Ubuntu 22.04/24.04 LTS
- Docker & Docker Compose support

**Services Required:**
- PostgreSQL 16
- Redis (latest)
- Nginx (reverse proxy with SSL)
- Docker Engine + Docker Compose

---

## Part 2: Hostinger VPS Deployment

### 2.1 VPS Setup Tasks

#### Task 2.1.1: Initial Server Setup
**[Browser Agent Task]**
```
1. Log into Hostinger hPanel
2. Navigate to VPS → Order/Manage VPS
3. Select KVM 2 plan (8GB RAM, 2 vCPUs, 100GB NVMe)
4. Choose location: Europe (closest to Latvia)
5. Select Ubuntu 22.04 as OS template
6. Set root password and SSH key
7. Note the VPS IP address
```

#### Task 2.1.2: Docker Installation
```bash
# Connect via SSH
ssh root@<VPS_IP>

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

#### Task 2.1.3: Domain Configuration
**[Browser Agent Task]**
```
1. Access Hostinger DNS management
2. Add A record: crm.controlitfactory.eu → VPS_IP
3. Add A record: @ (or subdomain) → VPS_IP
4. Wait for DNS propagation (5-30 minutes)
```

### 2.2 Application Deployment

#### Task 2.2.1: Create Project Directory
```bash
mkdir -p /opt/controlit-crm
cd /opt/controlit-crm
```

#### Task 2.2.2: Create Production Docker Compose
Create `/opt/controlit-crm/docker-compose.yml`:

```yaml
name: controlit-crm

services:
  server:
    image: twentycrm/twenty:${TAG:-latest}
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    ports:
      - "3000:3000"
    environment:
      NODE_PORT: 3000
      PG_DATABASE_URL: postgres://${PG_DATABASE_USER}:${PG_DATABASE_PASSWORD}@db:5432/default
      SERVER_URL: ${SERVER_URL}
      REDIS_URL: redis://redis:6379
      APP_SECRET: ${APP_SECRET}
      STORAGE_TYPE: local

      # Email configuration
      EMAIL_FROM_ADDRESS: ${EMAIL_FROM_ADDRESS}
      EMAIL_FROM_NAME: ${EMAIL_FROM_NAME}
      EMAIL_SYSTEM_ADDRESS: ${EMAIL_SYSTEM_ADDRESS}
      EMAIL_DRIVER: smtp
      EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST}
      EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT}
      EMAIL_SMTP_USER: ${EMAIL_SMTP_USER}
      EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD}

      # Auth settings
      AUTH_PASSWORD_ENABLED: "true"
      IS_EMAIL_VERIFICATION_REQUIRED: "true"

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
    image: twentycrm/twenty:${TAG:-latest}
    volumes:
      - server-local-data:/app/packages/twenty-server/.local-storage
    command: ["yarn", "worker:prod"]
    environment:
      PG_DATABASE_URL: postgres://${PG_DATABASE_USER}:${PG_DATABASE_PASSWORD}@db:5432/default
      SERVER_URL: ${SERVER_URL}
      REDIS_URL: redis://redis:6379
      DISABLE_DB_MIGRATIONS: "true"
      DISABLE_CRON_JOBS_REGISTRATION: "true"
      APP_SECRET: ${APP_SECRET}
      STORAGE_TYPE: local

      EMAIL_FROM_ADDRESS: ${EMAIL_FROM_ADDRESS}
      EMAIL_FROM_NAME: ${EMAIL_FROM_NAME}
      EMAIL_SYSTEM_ADDRESS: ${EMAIL_SYSTEM_ADDRESS}
      EMAIL_DRIVER: smtp
      EMAIL_SMTP_HOST: ${EMAIL_SMTP_HOST}
      EMAIL_SMTP_PORT: ${EMAIL_SMTP_PORT}
      EMAIL_SMTP_USER: ${EMAIL_SMTP_USER}
      EMAIL_SMTP_PASSWORD: ${EMAIL_SMTP_PASSWORD}

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
      POSTGRES_PASSWORD: ${PG_DATABASE_PASSWORD}
      POSTGRES_USER: ${PG_DATABASE_USER}
    healthcheck:
      test: pg_isready -U ${PG_DATABASE_USER} -h localhost -d postgres
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
```

#### Task 2.2.3: Create Environment File
Create `/opt/controlit-crm/.env`:

```bash
# Generate secrets
APP_SECRET=$(openssl rand -base64 32)

cat > /opt/controlit-crm/.env << EOF
TAG=latest

# Database
PG_DATABASE_USER=controlit_user
PG_DATABASE_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')

# Server
SERVER_URL=https://crm.controlitfactory.eu

# Security
APP_SECRET=${APP_SECRET}

# Email Configuration (SMTP)
EMAIL_FROM_ADDRESS=noreply@controlitfactory.eu
EMAIL_FROM_NAME=Controlit CRM
EMAIL_SYSTEM_ADDRESS=system@controlitfactory.eu
EMAIL_SMTP_HOST=smtp.hostinger.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=noreply@controlitfactory.eu
EMAIL_SMTP_PASSWORD=REPLACE_WITH_EMAIL_PASSWORD
EOF

chmod 600 /opt/controlit-crm/.env
```

#### Task 2.2.4: Setup Nginx Reverse Proxy with SSL
```bash
# Install Nginx and Certbot
apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config
cat > /etc/nginx/sites-available/controlit-crm << 'EOF'
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

        # File upload limits
        client_max_body_size 50M;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/controlit-crm /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d crm.controlitfactory.eu --non-interactive --agree-tos -m info@controlitfactory.eu
```

#### Task 2.2.5: Start Services
```bash
cd /opt/controlit-crm
docker compose pull
docker compose up -d

# Monitor logs
docker compose logs -f
```

### 2.3 Backup Configuration

Create `/opt/controlit-crm/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/controlit-crm"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker compose exec -T db pg_dump -U controlit_user default > $BACKUP_DIR/db_$DATE.sql

# Backup local storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C /var/lib/docker/volumes controlit-crm_server-local-data

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /opt/controlit-crm/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/controlit-crm/backup.sh >> /var/log/controlit-backup.log 2>&1" | crontab -
```

---

## Part 3: Branding Customization for Controlit

### 3.1 Brand Identity

Based on controlitfactory.eu analysis:
- **Primary Brand Colors**: Professional blue/teal tones (to be extracted from logo)
- **Logo**: Controlit Factory SVG logo
- **Tagline**: "We Make Waterproofing Testable"

### 3.2 Required Customizations

#### 3.2.1 Application Title & Meta Tags
**Files to modify:**

1. `/packages/twenty-front/index.html`
   - Change `<title>Twenty</title>` to `<title>Controlit CRM</title>`
   - Update meta description
   - Update OG tags

2. `/packages/twenty-front/public/manifest.json`
   - Change `"name": "Twenty"` to `"name": "Controlit CRM"`
   - Change `"short_name": "Twenty"` to `"short_name": "Controlit"`

#### 3.2.2 Theme Colors (Accent)
**Files to modify:**

1. `/packages/twenty-ui/src/theme/constants/AccentLight.ts`
   - Replace blue accent with Controlit brand color

2. `/packages/twenty-ui/src/theme/constants/AccentDark.ts`
   - Replace dark mode accent color

**Proposed Color Palette (based on typical industrial/tech branding):**
```typescript
// Light mode accent (to be confirmed with actual brand colors)
primary: '#0066CC',    // Controlit blue
secondary: '#004C99',  // Darker blue
tertiary: '#CCE0FF',   // Light blue
quaternary: '#E6F0FF', // Very light blue
```

#### 3.2.3 Logo & Favicon Replacement

**Assets to create/replace:**
```
/packages/twenty-front/public/images/icons/android/
  - android-launchericon-48-48.png
  - android-launchericon-72-72.png
  - android-launchericon-96-96.png
  - android-launchericon-144-144.png
  - android-launchericon-192-192.png
  - android-launchericon-512-512.png

/packages/twenty-front/public/images/icons/ios/
  - Various iOS icon sizes

/packages/twenty-front/public/images/icons/windows11/
  - Windows tile icons
```

**[Browser Agent Task]**
```
1. Download Controlit logo from controlitfactory.eu
2. Generate all required icon sizes using tool like realfavicongenerator.net
3. Create icons in both light and dark variants
```

#### 3.2.4 Default Workspace Logo
**File:** `/packages/twenty-front/src/modules/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo.ts`
- Replace default Twenty logo URL with Controlit logo

#### 3.2.5 Email Templates Branding
**Directory:** `/packages/twenty-emails/src/components/`
- Update `Logo.tsx` with Controlit branding
- Update `WhatIsTwenty.tsx` → rename to `WhatIsControlit.tsx`
- Update footer and header components

### 3.3 Build Custom Docker Image

After making branding changes, build a custom image:

```bash
# Clone and modify repository
git clone <repo-url> controlit-crm
cd controlit-crm

# Make branding changes (see above)

# Build custom image
docker build -t controlit-crm:latest -f packages/twenty-docker/twenty/Dockerfile .

# Tag for registry (if using)
docker tag controlit-crm:latest registry.controlitfactory.eu/controlit-crm:latest
```

---

## Part 4: Email Configuration

### 4.1 Email Setup Options

#### Option A: Hostinger Email (Recommended for simplicity)
**[Browser Agent Task]**
```
1. Log into Hostinger hPanel
2. Navigate to Email → Email Accounts
3. Create email accounts:
   - noreply@controlitfactory.eu
   - system@controlitfactory.eu
4. Note SMTP settings:
   - Host: smtp.hostinger.com
   - Port: 465 (SSL) or 587 (TLS)
   - Username: full email address
   - Password: email password
```

#### Option B: External SMTP Service (Better deliverability)
Recommended services:
- SendGrid (free tier: 100 emails/day)
- Mailgun (first 1000 emails free)
- Amazon SES (very cost-effective at scale)

### 4.2 Environment Variables for Email
```bash
# For Hostinger Email
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.hostinger.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=noreply@controlitfactory.eu
EMAIL_SMTP_PASSWORD=your_password
EMAIL_FROM_ADDRESS=noreply@controlitfactory.eu
EMAIL_FROM_NAME="Controlit CRM"
EMAIL_SYSTEM_ADDRESS=system@controlitfactory.eu
```

### 4.3 Email Templates to Customize

| Template | Purpose | File |
|----------|---------|------|
| Invite Link | Team member invitations | `send-invite-link.email.tsx` |
| Email Verification | Account verification | `send-email-verification-link.email.tsx` |
| Password Reset | Password recovery | `password-reset-link.email.tsx` |
| Password Update | Security notification | `password-update-notify.email.tsx` |

---

## Part 5: User Management & Registration

### 5.1 Initial Admin Setup

After deployment, the first user to register becomes the workspace admin.

**[Browser Agent Task]**
```
1. Navigate to https://crm.controlitfactory.eu
2. Click "Sign up" or "Create account"
3. Enter admin details:
   - Email: admin@controlitfactory.eu
   - Password: (strong password)
   - First Name: Admin
   - Last Name: User
4. This creates the primary workspace
5. Configure workspace:
   - Name: Controlit Factory
   - Logo: Upload Controlit logo
```

### 5.2 Manager Registration Flow

**Two Methods:**

#### Method A: Email Invitation (Recommended)
1. Admin navigates to Settings → Workspace Members
2. Click "Invite" button
3. Enter manager's email address
4. System sends invitation email
5. Manager clicks link and completes registration
6. Admin assigns appropriate role

#### Method B: Public Invite Link
1. Admin enables public invite link in Settings
2. Share the link with team members
3. Anyone with the link can join the workspace
4. Admin reviews and assigns roles after joining

### 5.3 Role Configuration for Controlit

**Recommended Roles:**

| Role | Description | Permissions |
|------|-------------|-------------|
| Admin | Full system access | All settings, all data, user management |
| Sales Manager | Manage deals & contacts | Read/write contacts, companies, deals |
| Support Agent | Customer inquiries | Read all, write own tasks/notes |
| Viewer | Read-only access | View contacts, companies, reports |

**Setup Steps:**
1. Navigate to Settings → Security → Roles
2. Create custom roles as needed
3. Assign permissions per role
4. Assign roles to team members

---

## Part 6: Post-Deployment Checklist

### 6.1 Security Hardening

- [ ] Change default PostgreSQL password
- [ ] Generate strong APP_SECRET
- [ ] Enable email verification requirement
- [ ] Configure firewall (UFW)
- [ ] Enable fail2ban for SSH
- [ ] Set up SSL certificate auto-renewal
- [ ] Disable root SSH login (use sudo user)

### 6.2 Monitoring Setup

```bash
# Install monitoring tools
apt install htop iotop -y

# Setup Docker logging limits
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker
```

### 6.3 Testing Checklist

- [ ] Access CRM via HTTPS (SSL working)
- [ ] User registration works
- [ ] Email sending works (test password reset)
- [ ] Data can be created (contacts, companies)
- [ ] File uploads work
- [ ] Background jobs process (check worker logs)

---

## Part 7: Implementation Timeline

### Phase 1: Infrastructure (Day 1)
1. Order and configure Hostinger VPS
2. Install Docker and dependencies
3. Configure domain DNS
4. Setup Nginx with SSL

### Phase 2: Base Deployment (Day 1-2)
1. Deploy Twenty CRM with Docker Compose
2. Verify all services running
3. Test basic functionality
4. Configure email settings

### Phase 3: Branding Customization (Day 2-3)
1. Create Controlit branded assets
2. Modify theme colors
3. Update application titles and meta
4. Customize email templates
5. Build and deploy custom image

### Phase 4: Configuration (Day 3-4)
1. Create admin account
2. Configure workspace settings
3. Set up roles and permissions
4. Invite initial team members
5. Import initial data (if any)

### Phase 5: Testing & Launch (Day 4-5)
1. Complete testing checklist
2. Security audit
3. Performance testing
4. User acceptance testing
5. Go-live

---

## Part 8: Browser Agent Tasks Summary

These tasks require browser interaction and should be performed by Claude's browser agent:

| ID | Task | Priority |
|----|------|----------|
| B1 | Order Hostinger VPS (KVM 2 plan) | High |
| B2 | Configure DNS for crm.controlitfactory.eu | High |
| B3 | Create Hostinger email accounts | High |
| B4 | Download Controlit logo from website | Medium |
| B5 | Generate favicon/icon assets | Medium |
| B6 | Initial admin registration in CRM | High |
| B7 | Configure workspace settings | High |
| B8 | Send test invitation email | Medium |

---

## Part 9: Maintenance Procedures

### 9.1 Updating the CRM

```bash
cd /opt/controlit-crm

# Pull latest image
docker compose pull

# Restart with new image
docker compose up -d

# Check logs for migration issues
docker compose logs -f server
```

### 9.2 Database Maintenance

```bash
# Vacuum and analyze
docker compose exec db psql -U controlit_user -d default -c "VACUUM ANALYZE;"

# Check database size
docker compose exec db psql -U controlit_user -d default -c "SELECT pg_size_pretty(pg_database_size('default'));"
```

### 9.3 Log Rotation

Already configured via Docker daemon settings. Logs are automatically rotated at 10MB, keeping 3 files.

---

## Part 10: Support & Resources

### Official Documentation
- Twenty CRM Docs: https://docs.twenty.com
- Self-Hosting Guide: https://docs.twenty.com/start/self-hosting

### Support Channels
- GitHub Issues: https://github.com/twentyhq/twenty/issues
- Discord Community: https://discord.gg/twenty

### Controlit Internal
- Technical Contact: [TBD]
- Admin Email: admin@controlitfactory.eu
- System Email: system@controlitfactory.eu

---

## Appendix A: Complete Environment Variables Reference

```bash
# Core Settings
TAG=latest
NODE_ENV=production
SERVER_URL=https://crm.controlitfactory.eu

# Database
PG_DATABASE_URL=postgres://controlit_user:PASSWORD@db:5432/default
PG_DATABASE_USER=controlit_user
PG_DATABASE_PASSWORD=SECURE_PASSWORD

# Redis
REDIS_URL=redis://redis:6379

# Security
APP_SECRET=RANDOM_64_CHAR_STRING

# Authentication
AUTH_PASSWORD_ENABLED=true
IS_EMAIL_VERIFICATION_REQUIRED=true

# Email
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.hostinger.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USER=noreply@controlitfactory.eu
EMAIL_SMTP_PASSWORD=EMAIL_PASSWORD
EMAIL_FROM_ADDRESS=noreply@controlitfactory.eu
EMAIL_FROM_NAME=Controlit CRM
EMAIL_SYSTEM_ADDRESS=system@controlitfactory.eu

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=.local-storage

# Token Expiration
ACCESS_TOKEN_EXPIRES_IN=30m
REFRESH_TOKEN_EXPIRES_IN=90d
PASSWORD_RESET_TOKEN_EXPIRES_IN=5m
```

---

*Document Version: 1.0*
*Created: December 2024*
*For: Controlit Factory (controlitfactory.eu)*
