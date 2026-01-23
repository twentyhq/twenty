# TASK: Switch to Controlit Branded Docker Image

## Objective
Update the deployed CRM to use the custom Controlit-branded Docker image from GitHub Container Registry.

## Prerequisites
- GitHub Actions build must complete first (check: https://github.com/akruminsh/controlit-crm/actions)
- Image available at: `ghcr.io/akruminsh/controlit-crm:latest`

---

## Steps

### Step 1: Connect to Server
1. Go to https://hpanel.hostinger.com
2. Click **VPS** → **srv1227475.hstgr.cloud**
3. Click **Browser terminal**
4. Login as `root`

### Step 2: Update docker-compose.yml

Run this command to update the image reference:

```bash
cd /opt/controlit-crm

# Backup current config
cp docker-compose.yml docker-compose.yml.backup

# Update image from twentycrm/twenty to ghcr.io/akruminsh/controlit-crm
sed -i 's|image: twentycrm/twenty:latest|image: ghcr.io/akruminsh/controlit-crm:latest|g' docker-compose.yml

# Verify the change
grep "image:" docker-compose.yml
```

### Step 3: Pull and Restart

```bash
# Pull new image
docker pull ghcr.io/akruminsh/controlit-crm:latest

# Restart with new image
docker compose down && docker compose up -d

# Wait for containers to be healthy
sleep 60

# Check status
docker compose ps
```

### Step 4: Verify Branding

1. Open https://crm.controlitfactory.eu in browser
2. Check:
   - Page title shows "Controlit CRM"
   - Login page shows "Welcome to Controlit CRM"
   - Gold/amber accent colors visible
   - Footer shows "By using Controlit CRM..."

---

## Return Information

```
Image Updated: Yes/No
New Image: ghcr.io/akruminsh/controlit-crm:latest
Containers Running: Yes/No
Branding Visible: Yes/No
Any Errors: _______________
```

---

## Rollback (if needed)

```bash
cd /opt/controlit-crm
cp docker-compose.yml.backup docker-compose.yml
docker compose down && docker compose up -d
```
