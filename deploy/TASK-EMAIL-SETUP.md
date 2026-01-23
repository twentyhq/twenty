# TASK: Configure SMTP Email for Controlit CRM

## Objective
Update the deployed CRM to use SMTP email for sending notifications, password resets, and invitations.

## Server Info
- **Hostname:** srv1227475.hstgr.cloud
- **Credentials:** Use VPS root credentials (not stored here)

## SMTP Configuration
- **SMTP Server:** mail.sigmanet.lv
- **Port:** 465 (SSL)
- **Credentials:** Contact system administrator for email credentials

---

## Steps

### Step 1: Connect to Server
1. Go to https://hpanel.hostinger.com
2. Click **VPS** → **srv1227475.hstgr.cloud**
3. Click **Browser terminal**
4. Login as `root`

### Step 2: Update Docker Compose
Edit `/opt/controlit-crm/docker-compose.yml` and add email environment variables to both `server` and `worker` services.

### Step 3: Restart Containers
```bash
cd /opt/controlit-crm && docker compose down && docker compose up -d
```

### Step 4: Verify
```bash
docker compose ps
```

---

**NOTE:** Actual credentials should be obtained from system administrator and never committed to version control.
