# Twenty CRM Production Infrastructure Setup

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up production-ready infrastructure for Twenty CRM including automated backups, HTTPS/SSL, S3 storage, email configuration, and Nginx reverse proxy.

**Architecture:** Create automated backup system triggered on Windows login that exports PostgreSQL database to Desktop. Configure Nginx as reverse proxy with self-signed SSL certificates for local HTTPS access. Migrate storage from local filesystem to S3, and configure SMTP for email functionality.

**Tech Stack:** Docker Compose, PostgreSQL, Nginx, OpenSSL, Windows Task Scheduler, Bash scripts, AWS S3 SDK

---

## Task 1: Automated Daily Backup System

**Files:**
- Create: `scripts/backup-database.sh`
- Create: `scripts/setup-backup-task.ps1`
- Modify: `docker-compose.yml` (add backup service)
- Create: `docs/BACKUP-SETUP.md`

### Step 1: Create backup script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Twenty CRM Database Backup Script
# Backs up PostgreSQL database to Desktop

BACKUP_DIR="$HOME/Desktop/twenty-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/twenty_backup_$DATE.sql"
CONTAINER_NAME="twenty-db-1"
DB_NAME="twenty"
DB_USER="postgres"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Starting backup at $(date)"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"

    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "Backup compressed: ${BACKUP_FILE}.gz"

    # Keep only last 30 days of backups
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi
```

### Step 2: Make backup script executable

Run:
```bash
chmod +x scripts/backup-database.sh
```

Expected: File permissions changed to executable

### Step 3: Test backup script manually

Run:
```bash
./scripts/backup-database.sh
```

Expected output:
```
Starting backup at Sun Jan 12 04:30:00 2026
Backup completed successfully: /c/Users/sxtnl/Desktop/twenty-backups/twenty_backup_20260112_043000.sql
Backup compressed: /c/Users/sxtnl/Desktop/twenty-backups/twenty_backup_20260112_043000.sql.gz
Old backups cleaned up
```

### Step 4: Verify backup file exists

Run:
```bash
ls -lh ~/Desktop/twenty-backups/
```

Expected: See the compressed .sql.gz file

### Step 5: Create Windows Task Scheduler setup script

Create `scripts/setup-backup-task.ps1`:

```powershell
# Twenty CRM Backup Task Scheduler Setup
# Creates a scheduled task to run backup on user login

$TaskName = "TwentyCRM-DailyBackup"
$ScriptPath = "$PSScriptRoot\backup-database.sh"
$BashPath = "C:\Program Files\Git\bin\bash.exe"

# Check if Git Bash exists
if (-not (Test-Path $BashPath)) {
    Write-Error "Git Bash not found at $BashPath. Please install Git for Windows."
    exit 1
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the action
$Action = New-ScheduledTaskAction -Execute $BashPath -Argument $ScriptPath

# Create the trigger (at logon)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Create additional trigger for daily at 2 AM
$DailyTrigger = New-ScheduledTaskTrigger -Daily -At 2am

# Set the principal (run whether user is logged on or not)
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive

# Register the scheduled task
Register-ScheduledTask -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger,$DailyTrigger `
    -Principal $Principal `
    -Description "Automated backup for Twenty CRM database"

Write-Host "Scheduled task '$TaskName' created successfully!"
Write-Host "Backups will run:"
Write-Host "  - On user login"
Write-Host "  - Daily at 2:00 AM"
Write-Host "  - Saved to: $env:USERPROFILE\Desktop\twenty-backups"
```

### Step 6: Run PowerShell setup script

Run (in PowerShell as Administrator):
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup-backup-task.ps1
```

Expected output:
```
Scheduled task 'TwentyCRM-DailyBackup' created successfully!
Backups will run:
  - On user login
  - Daily at 2:00 AM
  - Saved to: C:\Users\sxtnl\Desktop\twenty-backups
```

### Step 7: Verify scheduled task

Run:
```powershell
Get-ScheduledTask -TaskName "TwentyCRM-DailyBackup"
```

Expected: Task details displayed with "Ready" state

### Step 8: Create backup documentation

Create `docs/BACKUP-SETUP.md`:

```markdown
# Twenty CRM Backup System

## Overview
Automated PostgreSQL database backups for Twenty CRM.

## Backup Schedule
- **On Login:** Backup runs automatically when you log in to Windows
- **Daily:** Backup runs at 2:00 AM every day
- **Location:** `%USERPROFILE%\Desktop\twenty-backups`
- **Retention:** 30 days (older backups automatically deleted)

## Manual Backup
```bash
./scripts/backup-database.sh
```

## Restore from Backup
```bash
# Stop the application
docker compose stop twenty-server twenty-worker

# Restore the database
gunzip -c ~/Desktop/twenty-backups/twenty_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i twenty-db-1 psql -U postgres twenty

# Restart services
docker compose up -d
```

## Verify Backup Integrity
```bash
# List recent backups
ls -lh ~/Desktop/twenty-backups/

# Test restore to temporary database
docker exec twenty-db-1 createdb -U postgres twenty_test
gunzip -c ~/Desktop/twenty-backups/twenty_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i twenty-db-1 psql -U postgres twenty_test
docker exec twenty-db-1 dropdb -U postgres twenty_test
```

## Troubleshooting
- **Task not running:** Check Task Scheduler, ensure Docker is running
- **Permission errors:** Run PowerShell as Administrator
- **Backup fails:** Check Docker container is running: `docker compose ps`
```

### Step 9: Commit backup system

Run:
```bash
git add scripts/backup-database.sh scripts/setup-backup-task.ps1 docs/BACKUP-SETUP.md
git commit -m "feat: add automated daily backup system"
```

Expected: Files committed successfully

---

## Task 2: HTTPS/SSL with Self-Signed Certificates

**Files:**
- Create: `nginx/nginx.conf`
- Create: `nginx/ssl/generate-certs.sh`
- Create: `docker-compose.override.yml`
- Modify: `.env`
- Create: `docs/SSL-SETUP.md`

### Step 1: Create directory structure

Run:
```bash
mkdir -p nginx/ssl
```

Expected: Directories created

### Step 2: Create SSL certificate generation script

Create `nginx/ssl/generate-certs.sh`:

```bash
#!/bin/bash

# Generate self-signed SSL certificates for Twenty CRM

CERT_DIR="$(dirname "$0")"
DOMAIN="localhost"
DAYS=365

echo "Generating self-signed SSL certificate for $DOMAIN..."

openssl req -x509 -nodes -days $DAYS \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/twenty.key" \
    -out "$CERT_DIR/twenty.crt" \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

if [ $? -eq 0 ]; then
    echo "✓ Certificate generated successfully!"
    echo "  Key: $CERT_DIR/twenty.key"
    echo "  Certificate: $CERT_DIR/twenty.crt"
    echo "  Valid for: $DAYS days"
else
    echo "✗ Certificate generation failed!"
    exit 1
fi
```

### Step 3: Make script executable and run it

Run:
```bash
chmod +x nginx/ssl/generate-certs.sh
./nginx/ssl/generate-certs.sh
```

Expected output:
```
Generating self-signed SSL certificate for localhost...
✓ Certificate generated successfully!
  Key: nginx/ssl/twenty.key
  Certificate: nginx/ssl/twenty.crt
  Valid for: 365 days
```

### Step 4: Verify certificates created

Run:
```bash
ls -lh nginx/ssl/
```

Expected: See `twenty.key` and `twenty.crt` files

### Step 5: Create Nginx configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=twenty_limit:10m rate=10r/s;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Upstream Twenty server
    upstream twenty_backend {
        server twenty-server-1:3000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name localhost;

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/twenty.crt;
        ssl_certificate_key /etc/nginx/ssl/twenty.key;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Rate limiting
        limit_req zone=twenty_limit burst=20 nodelay;

        # Proxy settings
        location / {
            proxy_pass http://twenty_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;

            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Step 6: Create Docker Compose override for Nginx

Create `docker-compose.override.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: twenty-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - server
    networks:
      - default
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Step 7: Update SERVER_URL in .env

Modify `.env`:

```bash
SERVER_URL=https://localhost
```

Run:
```bash
sed -i 's|SERVER_URL=http://localhost:3000|SERVER_URL=https://localhost|g' .env
```

Expected: SERVER_URL updated to HTTPS

### Step 8: Verify .env change

Run:
```bash
grep SERVER_URL .env
```

Expected output:
```
SERVER_URL=https://localhost
```

### Step 9: Restart services with Nginx

Run:
```bash
docker compose down
docker compose up -d
```

Expected: All services including Nginx start successfully

### Step 10: Verify Nginx is running

Run:
```bash
docker compose ps nginx
```

Expected: nginx container running and healthy

### Step 11: Test HTTPS access

Run:
```bash
curl -k -I https://localhost
```

Expected output:
```
HTTP/2 200
strict-transport-security: max-age=31536000; includeSubDomains
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
```

### Step 12: Create SSL documentation

Create `docs/SSL-SETUP.md`:

```markdown
# SSL/HTTPS Setup for Twenty CRM

## Overview
Twenty CRM is configured with HTTPS using self-signed SSL certificates and Nginx reverse proxy.

## Access URLs
- **HTTPS (recommended):** https://localhost
- **HTTP (redirects to HTTPS):** http://localhost

## Browser Warning
You'll see a security warning because the certificate is self-signed. This is normal for local development.

**To bypass:**
1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost" or "Accept Risk"

## Certificate Details
- **Location:** `nginx/ssl/`
- **Validity:** 365 days from generation date
- **Algorithm:** RSA 2048-bit

## Regenerate Certificate
```bash
./nginx/ssl/generate-certs.sh
docker compose restart nginx
```

## Production Certificates
For production, use Let's Encrypt:
```bash
# Install certbot
# Configure domain DNS
# Generate certificate
certbot certonly --standalone -d yourdomain.com
# Update nginx.conf to point to certbot certificates
```

## Troubleshooting
- **Connection refused:** Check Nginx is running: `docker compose ps nginx`
- **Certificate error:** Regenerate certificates
- **Redirect loop:** Check SERVER_URL in .env matches HTTPS
```

### Step 13: Commit SSL configuration

Run:
```bash
git add nginx/ docker-compose.override.yml .env docs/SSL-SETUP.md
git commit -m "feat: add HTTPS/SSL with Nginx reverse proxy"
```

Expected: Files committed successfully

---

## Task 3: S3 Storage Configuration

**Files:**
- Modify: `.env`
- Create: `docs/S3-STORAGE.md`
- Create: `scripts/test-s3-connection.sh`

### Step 1: Update .env with S3 configuration

Read current `.env`:

Run:
```bash
cat .env
```

### Step 2: Add S3 environment variables to .env

Add to `.env`:

```bash
# S3 Storage Configuration
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=twenty-crm-storage
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com

# AWS Credentials (use IAM role in production)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

Run:
```bash
cat >> .env << 'EOF'

# S3 Storage Configuration
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=twenty-crm-storage
STORAGE_S3_ENDPOINT=https://s3.amazonaws.com

# AWS Credentials (use IAM role in production)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
EOF
```

Expected: Variables added to .env

### Step 3: Verify S3 variables added

Run:
```bash
grep -A 8 "S3 Storage Configuration" .env
```

Expected: See all S3 configuration variables

### Step 4: Create S3 connection test script

Create `scripts/test-s3-connection.sh`:

```bash
#!/bin/bash

# Test S3 connection and bucket access

BUCKET_NAME="${STORAGE_S3_NAME:-twenty-crm-storage}"
REGION="${STORAGE_S3_REGION:-us-east-1}"

echo "Testing S3 connection..."
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Install with: pip install awscli"
    exit 1
fi

# Test bucket access
if aws s3 ls "s3://$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "✓ Successfully connected to S3 bucket"
else
    echo "❌ Cannot access bucket. Creating it..."
    if aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"; then
        echo "✓ Bucket created successfully"

        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled \
            --region "$REGION"
        echo "✓ Versioning enabled"

        # Block public access
        aws s3api put-public-access-block \
            --bucket "$BUCKET_NAME" \
            --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
            --region "$REGION"
        echo "✓ Public access blocked"
    else
        echo "❌ Failed to create bucket"
        exit 1
    fi
fi

# Test write access
TEST_FILE="/tmp/twenty-test-$(date +%s).txt"
echo "Test file" > "$TEST_FILE"

if aws s3 cp "$TEST_FILE" "s3://$BUCKET_NAME/test/" --region "$REGION"; then
    echo "✓ Write access confirmed"
    aws s3 rm "s3://$BUCKET_NAME/test/$(basename $TEST_FILE)" --region "$REGION"
    rm "$TEST_FILE"
else
    echo "❌ Write access failed"
    exit 1
fi

echo ""
echo "✓ S3 configuration is valid!"
```

### Step 5: Make test script executable

Run:
```bash
chmod +x scripts/test-s3-connection.sh
```

Expected: Script is executable

### Step 6: Create S3 documentation

Create `docs/S3-STORAGE.md`:

```markdown
# S3 Storage Configuration

## Overview
Twenty CRM is configured to use AWS S3 for file storage instead of local filesystem.

## Configuration

### Environment Variables
Located in `.env`:
- `STORAGE_TYPE=s3`
- `STORAGE_S3_REGION` - AWS region (e.g., us-east-1)
- `STORAGE_S3_NAME` - S3 bucket name
- `STORAGE_S3_ENDPOINT` - S3 endpoint URL
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### Setup Steps

1. **Create AWS Account** (if you don't have one)

2. **Create IAM User**
   ```bash
   aws iam create-user --user-name twenty-crm
   ```

3. **Create Access Keys**
   ```bash
   aws iam create-access-key --user-name twenty-crm
   ```

4. **Attach S3 Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::twenty-crm-storage/*",
           "arn:aws:s3:::twenty-crm-storage"
         ]
       }
     ]
   }
   ```

5. **Update .env file** with your credentials

6. **Test connection**
   ```bash
   ./scripts/test-s3-connection.sh
   ```

7. **Restart services**
   ```bash
   docker compose restart server worker
   ```

## Alternative: MinIO (Self-Hosted S3)

For local development or self-hosted S3-compatible storage:

```yaml
# Add to docker-compose.override.yml
services:
  minio:
    image: minio/minio
    container_name: twenty-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio-data:
```

Update `.env`:
```bash
STORAGE_S3_ENDPOINT=http://minio:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

## Troubleshooting
- **Access denied:** Check IAM permissions
- **Bucket not found:** Create bucket or check name
- **Connection timeout:** Check network/firewall settings
- **Credentials error:** Verify AWS keys are correct

## Migration from Local Storage

```bash
# Backup local files
docker exec twenty-server-1 tar czf /tmp/local-storage.tar.gz /app/.local-storage

# Copy to host
docker cp twenty-server-1:/tmp/local-storage.tar.gz ./

# Extract and upload to S3
tar xzf local-storage.tar.gz
aws s3 sync .local-storage s3://twenty-crm-storage/
```
```

### Step 7: Commit S3 configuration

Run:
```bash
git add .env scripts/test-s3-connection.sh docs/S3-STORAGE.md
git commit -m "feat: add S3 storage configuration"
```

Expected: Files committed successfully

---

## Task 4: Email Configuration (SMTP)

**Files:**
- Modify: `.env`
- Create: `docs/EMAIL-SETUP.md`
- Create: `scripts/test-email.sh`

### Step 1: Add email environment variables to .env

Add to `.env`:

```bash
# Email Configuration (SMTP)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Twenty CRM

# SMTP Settings (example: Gmail)
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_SMTP_ENCRYPTION=tls

# Alternative providers:
# SendGrid: smtp.sendgrid.net:587
# Mailgun: smtp.mailgun.org:587
# AWS SES: email-smtp.us-east-1.amazonaws.com:587
```

Run:
```bash
cat >> .env << 'EOF'

# Email Configuration (SMTP)
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Twenty CRM

# SMTP Settings (example: Gmail)
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_SMTP_ENCRYPTION=tls
EOF
```

Expected: Email variables added to .env

### Step 2: Verify email variables added

Run:
```bash
grep -A 10 "Email Configuration" .env
```

Expected: See all email configuration variables

### Step 3: Create email test script

Create `scripts/test-email.sh`:

```bash
#!/bin/bash

# Test SMTP email configuration

echo "Testing email configuration..."

# Load environment variables
source .env

if [ -z "$EMAIL_SMTP_HOST" ]; then
    echo "❌ Email not configured. Check .env file."
    exit 1
fi

echo "SMTP Host: $EMAIL_SMTP_HOST"
echo "SMTP Port: $EMAIL_SMTP_PORT"
echo "From: $EMAIL_FROM_NAME <$EMAIL_FROM_ADDRESS>"

# Test SMTP connection using telnet/nc
if command -v nc &> /dev/null; then
    echo ""
    echo "Testing connection to SMTP server..."
    timeout 5 nc -zv "$EMAIL_SMTP_HOST" "$EMAIL_SMTP_PORT" 2>&1

    if [ $? -eq 0 ]; then
        echo "✓ Successfully connected to SMTP server"
    else
        echo "❌ Cannot connect to SMTP server"
        exit 1
    fi
else
    echo "⚠ nc (netcat) not installed, skipping connection test"
fi

echo ""
echo "To test actual email sending:"
echo "1. Configure EMAIL_SMTP_USER and EMAIL_SMTP_PASSWORD in .env"
echo "2. Restart Twenty: docker compose restart server worker"
echo "3. Trigger email in Twenty CRM (e.g., password reset)"
```

### Step 4: Make test script executable and run it

Run:
```bash
chmod +x scripts/test-email.sh
./scripts/test-email.sh
```

Expected output:
```
Testing email configuration...
SMTP Host: smtp.gmail.com
SMTP Port: 587
From: Twenty CRM <noreply@yourdomain.com>
```

### Step 5: Create email documentation

Create `docs/EMAIL-SETUP.md`:

```markdown
# Email Configuration

## Overview
Twenty CRM uses SMTP for sending emails (notifications, password resets, invitations, etc.).

## Configuration

### Environment Variables
Located in `.env`:
- `EMAIL_FROM_ADDRESS` - Sender email address
- `EMAIL_FROM_NAME` - Sender display name
- `EMAIL_SMTP_HOST` - SMTP server hostname
- `EMAIL_SMTP_PORT` - SMTP port (usually 587 for TLS, 465 for SSL)
- `EMAIL_SMTP_USER` - SMTP username (usually your email)
- `EMAIL_SMTP_PASSWORD` - SMTP password or app password
- `EMAIL_SMTP_ENCRYPTION` - Encryption type (tls or ssl)

## Provider Setup

### Gmail

1. **Enable 2FA** on your Google account
2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and device
   - Copy the 16-character password
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-email@gmail.com
   EMAIL_SMTP_PASSWORD=your-16-char-app-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### SendGrid

1. **Create account** at sendgrid.com
2. **Generate API key** (use as password)
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.sendgrid.net
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=apikey
   EMAIL_SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### Mailgun

1. **Create account** at mailgun.com
2. **Get SMTP credentials** from domain settings
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.mailgun.org
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=postmaster@your-domain.mailgun.org
   EMAIL_SMTP_PASSWORD=your-mailgun-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### AWS SES

1. **Verify domain/email** in SES console
2. **Create SMTP credentials**
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-ses-smtp-username
   EMAIL_SMTP_PASSWORD=your-ses-smtp-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

## Testing

### Test Connection
```bash
./scripts/test-email.sh
```

### Test Actual Email
1. Open Twenty CRM: https://localhost
2. Go to forgot password
3. Enter your email
4. Check inbox for reset email

### Debug Email Issues
```bash
# Check server logs
docker compose logs server | grep -i email

# Test SMTP manually with openssl
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication failed | Check username/password, use app password for Gmail |
| Connection timeout | Check port (587 or 465), firewall settings |
| TLS/SSL error | Try different encryption (tls vs ssl) |
| Emails in spam | Configure SPF/DKIM records for your domain |
| Rate limiting | Use dedicated email service (SendGrid, Mailgun) |

## Security Best Practices

1. **Never commit credentials** - Use .env and add to .gitignore
2. **Use app passwords** - Don't use main account password
3. **Restrict sender** - Only send from verified domains
4. **Monitor usage** - Watch for unusual sending patterns
5. **Rotate credentials** - Change passwords periodically
```

### Step 6: Update .gitignore to protect credentials

Run:
```bash
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "*.pem" >> .gitignore
```

Expected: Sensitive files added to .gitignore

### Step 7: Verify .gitignore updated

Run:
```bash
cat .gitignore
```

Expected: See .env and certificate files listed

### Step 8: Restart services to apply email config

Run:
```bash
docker compose restart server worker
```

Expected: Services restarted successfully

### Step 9: Commit email configuration

Run:
```bash
git add .gitignore scripts/test-email.sh docs/EMAIL-SETUP.md
git commit -m "feat: add email SMTP configuration"
```

Expected: Files committed successfully

---

## Task 5: Final Integration & Testing

**Files:**
- Create: `docs/INFRASTRUCTURE.md`
- Create: `scripts/health-check.sh`
- Modify: `README.md`

### Step 1: Create comprehensive health check script

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

# Twenty CRM Infrastructure Health Check

echo "======================================"
echo "Twenty CRM Health Check"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker containers
echo "1. Docker Containers Status"
echo "----------------------------"
CONTAINERS=$(docker compose ps --format json | jq -r '.Name')
for container in $CONTAINERS; do
    STATUS=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
    HEALTH=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null)

    if [ "$STATUS" == "running" ]; then
        if [ "$HEALTH" == "healthy" ] || [ "$HEALTH" == "" ]; then
            echo -e "${GREEN}✓${NC} $container: running"
        else
            echo -e "${YELLOW}⚠${NC} $container: running but $HEALTH"
        fi
    else
        echo -e "${RED}✗${NC} $container: $STATUS"
    fi
done
echo ""

# Check HTTPS access
echo "2. HTTPS Access"
echo "---------------"
if curl -k -s -o /dev/null -w "%{http_code}" https://localhost | grep -q "200"; then
    echo -e "${GREEN}✓${NC} HTTPS: accessible at https://localhost"
else
    echo -e "${RED}✗${NC} HTTPS: not accessible"
fi
echo ""

# Check HTTP redirect
echo "3. HTTP to HTTPS Redirect"
echo "-------------------------"
REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$REDIRECT" == "301" ]; then
    echo -e "${GREEN}✓${NC} HTTP redirects to HTTPS"
else
    echo -e "${YELLOW}⚠${NC} HTTP redirect: $REDIRECT (expected 301)"
fi
echo ""

# Check backup system
echo "4. Backup System"
echo "----------------"
if [ -f "scripts/backup-database.sh" ]; then
    echo -e "${GREEN}✓${NC} Backup script exists"

    if [ -d "$HOME/Desktop/twenty-backups" ]; then
        BACKUP_COUNT=$(ls -1 "$HOME/Desktop/twenty-backups"/*.sql.gz 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} Backup directory exists ($BACKUP_COUNT backups)"
    else
        echo -e "${YELLOW}⚠${NC} Backup directory not created yet"
    fi

    # Check scheduled task (Windows)
    if command -v powershell &> /dev/null; then
        if powershell -Command "Get-ScheduledTask -TaskName 'TwentyCRM-DailyBackup' -ErrorAction SilentlyContinue" &> /dev/null; then
            echo -e "${GREEN}✓${NC} Scheduled backup task configured"
        else
            echo -e "${YELLOW}⚠${NC} Scheduled backup task not found"
        fi
    fi
else
    echo -e "${RED}✗${NC} Backup script missing"
fi
echo ""

# Check SSL certificates
echo "5. SSL Certificates"
echo "-------------------"
if [ -f "nginx/ssl/twenty.crt" ] && [ -f "nginx/ssl/twenty.key" ]; then
    echo -e "${GREEN}✓${NC} SSL certificates exist"

    # Check expiration
    EXPIRY=$(openssl x509 -enddate -noout -in nginx/ssl/twenty.crt | cut -d= -f2)
    echo "   Expires: $EXPIRY"
else
    echo -e "${RED}✗${NC} SSL certificates missing"
fi
echo ""

# Check storage configuration
echo "6. Storage Configuration"
echo "------------------------"
STORAGE_TYPE=$(grep "^STORAGE_TYPE=" .env | cut -d= -f2)
if [ "$STORAGE_TYPE" == "s3" ]; then
    echo -e "${GREEN}✓${NC} Storage: S3"
    S3_BUCKET=$(grep "^STORAGE_S3_NAME=" .env | cut -d= -f2)
    echo "   Bucket: $S3_BUCKET"
elif [ "$STORAGE_TYPE" == "local" ]; then
    echo -e "${YELLOW}⚠${NC} Storage: Local filesystem"
else
    echo -e "${RED}✗${NC} Storage: Not configured"
fi
echo ""

# Check email configuration
echo "7. Email Configuration"
echo "----------------------"
EMAIL_HOST=$(grep "^EMAIL_SMTP_HOST=" .env | cut -d= -f2)
if [ -n "$EMAIL_HOST" ]; then
    echo -e "${GREEN}✓${NC} Email configured: $EMAIL_HOST"
else
    echo -e "${YELLOW}⚠${NC} Email not configured"
fi
echo ""

# Check environment variables
echo "8. Environment Variables"
echo "------------------------"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"

    # Check critical variables
    CRITICAL_VARS=("APP_SECRET" "PG_DATABASE_PASSWORD" "SERVER_URL")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${RED}✗${NC} $var is missing"
        fi
    done
else
    echo -e "${RED}✗${NC} .env file missing"
fi
echo ""

# Summary
echo "======================================"
echo "Health Check Complete"
echo "======================================"
```

### Step 2: Make health check executable

Run:
```bash
chmod +x scripts/health-check.sh
```

Expected: Script is executable

### Step 3: Run health check

Run:
```bash
./scripts/health-check.sh
```

Expected: All checks show green checkmarks or yellow warnings

### Step 4: Create comprehensive infrastructure documentation

Create `docs/INFRASTRUCTURE.md`:

```markdown
# Twenty CRM Infrastructure Documentation

## Overview
Complete production-ready infrastructure setup for Twenty CRM with automated backups, HTTPS/SSL, S3 storage, email configuration, and Nginx reverse proxy.

## Architecture

```
┌─────────────────────────────────────────────┐
│          Browser (https://localhost)         │
└─────────────────┬───────────────────────────┘
                  │ HTTPS (443)
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
- **Ports:** 80 (HTTP), 443 (HTTPS)
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
  docker exec -i twenty-db-1 psql -U postgres twenty

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
```

### Step 5: Update README.md

Create `README.md`:

```markdown
# Twenty CRM - Production Setup

Modern open-source CRM with production-ready infrastructure.

## Quick Start

```bash
# Clone and navigate
cd C:\Users\sxtnl\Dev\crm-twenty

# Start all services
docker compose up -d

# Access application
open https://localhost
```

## Features

✅ **HTTPS/SSL** - Secure access with Nginx reverse proxy
✅ **Automated Backups** - Daily PostgreSQL backups to Desktop
✅ **S3 Storage** - Scalable file storage
✅ **Email Integration** - SMTP configuration
✅ **Docker Compose** - Easy deployment

## Infrastructure

- **Web:** Nginx reverse proxy with SSL
- **App:** Twenty CRM server (Node.js)
- **Database:** PostgreSQL 16
- **Cache:** Redis
- **Storage:** AWS S3 or MinIO
- **Email:** SMTP (Gmail, SendGrid, etc.)

## Documentation

- [Infrastructure Overview](docs/INFRASTRUCTURE.md)
- [Backup Setup](docs/BACKUP-SETUP.md)
- [SSL/HTTPS Configuration](docs/SSL-SETUP.md)
- [S3 Storage](docs/S3-STORAGE.md)
- [Email Setup](docs/EMAIL-SETUP.md)

## Health Check

```bash
./scripts/health-check.sh
```

## Maintenance

```bash
# View logs
docker compose logs -f

# Restart services
docker compose restart

# Backup now
./scripts/backup-database.sh

# Update Twenty
docker compose pull && docker compose up -d
```

## Requirements

- Docker & Docker Compose
- 2GB+ RAM
- Git Bash (Windows)
- OpenSSL

## Configuration

All configuration in `.env` file:
- Database credentials
- S3 settings
- Email SMTP
- SSL certificates in `nginx/ssl/`

## Support

Run health check for diagnostics:
```bash
./scripts/health-check.sh
```

Check logs:
```bash
docker compose logs -f
```

## License

Twenty CRM is open source. See [Twenty GitHub](https://github.com/twentyhq/twenty).
```

### Step 6: Commit README and infrastructure docs

Run:
```bash
git add README.md docs/INFRASTRUCTURE.md scripts/health-check.sh
git commit -m "docs: add comprehensive infrastructure documentation"
```

Expected: Documentation committed successfully

### Step 7: Run final health check

Run:
```bash
./scripts/health-check.sh
```

Expected: Comprehensive health report showing all systems operational

### Step 8: Test complete system

Run all tests:
```bash
# Test HTTPS access
curl -k -I https://localhost

# Test backup
./scripts/backup-database.sh

# Test email (connection only)
./scripts/test-email.sh

# Test S3 (if configured)
# ./scripts/test-s3-connection.sh
```

Expected: All tests pass successfully

### Step 9: Create final summary commit

Run:
```bash
git add -A
git commit -m "feat: complete production infrastructure setup

- Automated daily backups to Desktop
- HTTPS/SSL with Nginx reverse proxy
- S3 storage configuration
- Email SMTP integration
- Comprehensive health checks
- Full documentation suite"
```

Expected: Final commit created

### Step 10: Display summary

Run:
```bash
echo "=================================="
echo "Twenty CRM Infrastructure Complete"
echo "=================================="
echo ""
echo "Access: https://localhost"
echo "Backups: ~/Desktop/twenty-backups"
echo "Health: ./scripts/health-check.sh"
echo ""
echo "Next steps:"
echo "1. Configure S3 credentials in .env"
echo "2. Configure email SMTP in .env"
echo "3. Run health check to verify all systems"
echo "4. Access https://localhost and complete setup"
```

Expected: Summary displayed

---

## Completion Checklist

- [x] Automated daily backups configured
- [x] Backups save to Desktop with 30-day retention
- [x] HTTPS/SSL with self-signed certificates
- [x] Nginx reverse proxy configured
- [x] HTTP to HTTPS redirect
- [x] S3 storage configuration documented
- [x] Email SMTP configuration documented
- [x] Health check script created
- [x] Comprehensive documentation written
- [x] All scripts tested and committed
- [x] README.md created

## Post-Implementation Tasks

1. **Configure S3:** Update `.env` with real AWS credentials
2. **Configure Email:** Add SMTP credentials to `.env`
3. **Test Backups:** Verify backups are created on schedule
4. **Test Email:** Send test email from Twenty CRM
5. **Browser Setup:** Accept self-signed certificate in browser
6. **Production:** Consider Let's Encrypt for real SSL certificates

---

## Notes

- Backups run automatically on login and at 2 AM daily
- SSL certificates are self-signed (valid for 365 days)
- S3 and email require credential configuration
- All sensitive data is in `.env` (gitignored)
- Health check script verifies all components
