# OVHcloud Setup Guide - Step-by-Step

This guide walks you through setting up OVHcloud infrastructure for Twenty CRM deployment, with exact steps and screenshots descriptions.

**Total Time Required:** 1-2 hours
**Total Cost:** €144-259/month

---

## Prerequisites

- [ ] Valid credit card or PayPal account
- [ ] Email address for account verification
- [ ] Domain names registered (yourcrm.com and api.yourcrm.com)
- [ ] Computer with kubectl installed

---

## Phase 1: Create OVHcloud Account (15 minutes)

### Step 1.1: Sign Up

1. Go to https://www.ovhcloud.com/
2. Click **"Sign up"** in top-right corner
3. Fill in registration form:
   - **Email address**: Your email
   - **Password**: Strong password (min 12 characters)
   - **Country**: Select your country
4. Click **"Create account"**
5. Check your email for verification link
6. Click verification link to activate account

### Step 1.2: Add Payment Method

1. Log in to OVHcloud Control Panel
2. Go to **"My account"** → **"Billing"** → **"Payment methods"**
3. Click **"Add a payment method"**
4. Choose:
   - **Credit card** (recommended)
   - Or **PayPal**
5. Enter payment details
6. Click **"Add"**

**✓ Account Setup Complete**

---

## Phase 2: Create Managed Kubernetes Cluster (30 minutes)

### Step 2.1: Navigate to Kubernetes Service

1. In OVHcloud Control Panel, click **"Public Cloud"** in left menu
2. If first time: Click **"Create a Public Cloud project"**
   - **Project name**: "Twenty CRM Production"
   - Click **"Create project"**
3. In Public Cloud dashboard, go to:
   ```
   Containers & Orchestration → Managed Kubernetes Service
   ```
4. Click **"Create a Kubernetes cluster"**

### Step 2.2: Configure Cluster

**Page 1: Cluster Configuration**

1. **Cluster name**: `twenty-crm-prod`
2. **Region**: Choose based on your location:
   - **Europe**:
     - GRA (Gravelines, France) - Most popular
     - SBG (Strasbourg, France)
     - UK (United Kingdom)
   - **North America**: BHS (Beauharnois, Canada)
   - **Asia**: SGP (Singapore)
3. **Kubernetes version**: Select **latest stable** (1.28 or higher)
4. **Plan**:
   - **Recommended**: MKS Standard (99.99% SLA) - €0.09/hour (~€65/month)
   - **Budget option**: MKS Free (99.5% SLA) - €0/month
5. Click **"Next"**

**Page 2: Node Pool Configuration**

1. **Node pool name**: `main-pool`
2. **Flavor** (instance type):
   - **Recommended**: B2-15 (4 vCPU, 15GB RAM) - ~€36/month per node
   - **Budget option**: B2-7 (2 vCPU, 7GB RAM) - ~€20/month per node
3. **Number of nodes**: `3` (for high availability)
4. **Auto-scaling**:
   - ✅ Enable
   - **Min nodes**: 3
   - **Max nodes**: 6
5. **Anti-affinity**: ✅ Enable (spreads nodes across different hosts)
6. Click **"Next"**

**Page 3: Review & Create**

1. Review configuration
2. **Estimated cost**:
   - Cluster: €65/month (or €0 for free tier)
   - Nodes: ~€110/month (3x B2-15)
   - **Total**: ~€175/month
3. ✅ Accept terms and conditions
4. Click **"Create cluster"**

### Step 2.3: Wait for Cluster Provisioning

1. **Status**: "Creating..." (takes ~10-15 minutes)
2. Progress indicators:
   - Creating control plane ✓
   - Deploying worker nodes ✓
   - Configuring networking ✓
3. **Status changes to**: "Ready" (green checkmark)

### Step 2.4: Download Kubeconfig

1. When cluster is ready, click **cluster name** (`twenty-crm-prod`)
2. Click **"Service"** tab
3. Find **"Kubeconfig"** section
4. Click **"Download kubeconfig"** button
5. Save file as: `~/twenty-crm-kubeconfig.yaml`

### Step 2.5: Configure kubectl

```bash
# Set kubeconfig path
export KUBECONFIG=~/twenty-crm-kubeconfig.yaml

# Verify connection
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://xxxxx.c1.gra7.k8s.ovh.net
# CoreDNS is running at https://xxxxx.c1.gra7.k8s.ovh.net/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

# Check nodes
kubectl get nodes

# Expected output: 3 nodes in Ready status
# NAME                              STATUS   ROLES    AGE   VERSION
# twenty-crm-prod-node-xxxxx        Ready    <none>   5m    v1.28.x
# twenty-crm-prod-node-xxxxx        Ready    <none>   5m    v1.28.x
# twenty-crm-prod-node-xxxxx        Ready    <none>   5m    v1.28.x
```

**✓ Kubernetes Cluster Ready**

---

## Phase 3: Create PostgreSQL Database (20 minutes)

### Step 3.1: Navigate to Databases

1. In OVHcloud Control Panel, go to:
   ```
   Public Cloud → Databases
   ```
2. Click **"Create a database"**

### Step 3.2: Select Database Engine

1. **Engine**: Select **PostgreSQL**
2. **Version**: Select **16** (or latest stable)
3. Click **"Next"**

### Step 3.3: Configure Database

**Page 1: Configuration**

1. **Name**: `twenty-crm-db`
2. **Region**: **Same as your Kubernetes cluster** (e.g., GRA)
3. **Plan**:
   - **Recommended**: Business (automatic backups, multi-AZ)
   - **Budget**: Essential (single node, manual backups)
4. **Flavor** (instance size):
   - **Recommended**: db1-15 (4 vCPU, 15GB RAM, 240GB storage) - ~€30/month
   - **Budget**: db1-7 (2 vCPU, 7GB RAM, 160GB storage) - ~€20/month
5. Click **"Next"**

**Page 2: Network Configuration**

1. **Private network**:
   - Leave unchecked (use public access)
   - We'll restrict by IP later
2. **Backup retention**: 7 days (recommended)
3. **Backup window**: 03:00-04:00 UTC
4. Click **"Next"**

**Page 3: Review & Create**

1. Review configuration
2. **Estimated cost**: ~€30/month (Business db1-15)
3. Click **"Create database"**

### Step 3.4: Wait for Provisioning

1. **Status**: "Creating..." (takes ~5-10 minutes)
2. **Status changes to**: "Running"

### Step 3.5: Get Connection Details

1. Click **database name** (`twenty-crm-db`)
2. Go to **"General information"** tab
3. **Note down**:
   - **Host**: `postgresql-xxxxx.priv.cloud.ovh.net`
   - **Port**: `5432`
   - **Database name**: `defaultdb` (we'll create `twentycrm` later)
4. Go to **"Users"** tab
5. **Note down**:
   - **Username**: `avnadmin` (default admin user)
   - Click **"Reset password"** to get password
   - **IMPORTANT**: Copy password immediately (shown only once!)

### Step 3.6: Create Database

```bash
# Connect to PostgreSQL (replace with your credentials)
psql "postgresql://avnadmin:YOUR_PASSWORD@postgresql-xxxxx.priv.cloud.ovh.net:5432/defaultdb?sslmode=require"

# Create database for Twenty CRM
CREATE DATABASE twentycrm;

# Verify
\l twentycrm

# Exit
\q
```

### Step 3.7: Construct Connection String

Format:
```
postgresql://avnadmin:YOUR_PASSWORD@postgresql-xxxxx.priv.cloud.ovh.net:5432/twentycrm?sslmode=require
```

**Save this for secrets.yaml!**

**✓ PostgreSQL Database Ready**

---

## Phase 4: Create Redis/Valkey Instance (15 minutes)

### Step 4.1: Navigate to Databases

1. In OVHcloud Control Panel, go to:
   ```
   Public Cloud → Databases
   ```
2. Click **"Create a database"**

### Step 4.2: Select Database Engine

1. **Engine**: Select **Valkey** (Redis-compatible, 20% cheaper)
   - If Valkey not available, select **Redis**
2. **Version**: Latest stable (7.x)
3. Click **"Next"**

### Step 4.3: Configure Redis/Valkey

**Page 1: Configuration**

1. **Name**: `twenty-crm-redis`
2. **Region**: **Same as Kubernetes cluster** (e.g., GRA)
3. **Plan**: Business (recommended for persistence)
4. **Flavor**:
   - **Recommended**: db1-4 (1 vCPU, 4GB RAM) - ~€18/month
   - **Budget**: db1-2 (1 vCPU, 2GB RAM) - ~€12/month
5. Click **"Next"**

**Page 2: Network & Persistence**

1. **Persistence**:
   - ✅ Enable RDB (snapshots)
   - ✅ Enable AOF (append-only file)
   - **Important for BullMQ queue durability!**
2. **Backup window**: 03:00-05:00 UTC
3. Click **"Next"**

**Page 3: Review & Create**

1. Review configuration
2. **Estimated cost**: ~€18/month (Valkey) or ~€22/month (Redis)
3. Click **"Create database"**

### Step 4.4: Wait for Provisioning

1. **Status**: "Creating..." (takes ~5-8 minutes)
2. **Status changes to**: "Running"

### Step 4.5: Get Connection Details

1. Click **database name** (`twenty-crm-redis`)
2. Go to **"General information"** tab
3. **Note down**:
   - **Host**: `valkey-xxxxx.priv.cloud.ovh.net` (or `redis-xxxxx...`)
   - **Port**: `6379`
4. Go to **"Users"** tab
5. **Default user**: `default`
   - Click **"Reset password"** to get password
   - **IMPORTANT**: Copy password immediately!

### Step 4.6: Test Connection

```bash
# Test connection (replace with your credentials)
redis-cli -h valkey-xxxxx.priv.cloud.ovh.net -p 6379 -a YOUR_PASSWORD --tls

# Test command
PING
# Expected: PONG

# Exit
exit
```

### Step 4.7: Construct Connection String

Format:
```
rediss://default:YOUR_PASSWORD@valkey-xxxxx.priv.cloud.ovh.net:6379
```

**Note**: Use `rediss://` (with double 's') for TLS connection

**Save this for secrets.yaml!**

**✓ Redis/Valkey Ready**

---

## Phase 5: Create Object Storage (S3) (20 minutes)

### Step 5.1: Navigate to Object Storage

1. In OVHcloud Control Panel, go to:
   ```
   Public Cloud → Storage → Object Storage
   ```
2. Click **"Create an Object Container"**

### Step 5.2: Configure Storage Container

1. **Region**: **Same as Kubernetes cluster** (e.g., GRA)
2. **Storage class**:
   - **Standard**: For frequently accessed files (recommended)
   - **Cold Archive**: For long-term storage (cheaper but slower)
3. **Container name**: `twenty-crm-files`
4. **Public/Private**:
   - Select **Private** (secure, access via credentials)
5. Click **"Create"**

### Step 5.3: Create S3 User

1. Go to **"Users"** in left sidebar
2. Click **"Create user"**
3. **Username**: `twenty-s3-access`
4. **Role**: Administrator (full S3 access)
5. Click **"Create"**

### Step 5.4: Generate S3 Credentials

1. Click on user **"twenty-s3-access"**
2. Go to **"S3 credentials"** tab
3. Click **"Generate S3 credentials"**
4. **Note down**:
   - **Access Key ID**: `xxxxxxxxxxxxxxxxxxxxx`
   - **Secret Access Key**: `yyyyyyyyyyyyyyyyyyyyyy`
   - **IMPORTANT**: Copy both immediately (secret shown only once!)

### Step 5.5: Get S3 Endpoint

1. Go back to **"Object Storage"**
2. Click on container **"twenty-crm-files"**
3. **Endpoint by region**:
   - **GRA**: `https://s3.gra.cloud.ovh.net`
   - **SBG**: `https://s3.sbg.cloud.ovh.net`
   - **BHS**: `https://s3.bhs.cloud.ovh.net`
   - **UK**: `https://s3.uk.cloud.ovh.net`
   - **SGP**: `https://s3.sgp.cloud.ovh.net`

### Step 5.6: Test S3 Access

```bash
# Install AWS CLI if not installed
pip install awscli

# Configure profile
aws configure --profile ovh
# AWS Access Key ID: [your-access-key-id]
# AWS Secret Access Key: [your-secret-access-key]
# Default region name: gra
# Default output format: json

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://twenty-crm-files/test.txt \
  --endpoint-url https://s3.gra.cloud.ovh.net \
  --profile ovh

# Expected output:
# upload: ./test.txt to s3://twenty-crm-files/test.txt

# Test list
aws s3 ls s3://twenty-crm-files/ \
  --endpoint-url https://s3.gra.cloud.ovh.net \
  --profile ovh

# Expected output:
# 2024-02-14 12:00:00          5 test.txt

# Clean up test
rm test.txt
```

### Step 5.7: Note S3 Configuration

Save for secrets.yaml:
```
STORAGE_S3_NAME: "twenty-crm-files"
STORAGE_S3_REGION: "gra"  # Your region
STORAGE_S3_ENDPOINT: "https://s3.gra.cloud.ovh.net"
STORAGE_S3_ACCESS_KEY_ID: "xxxxxxxxxxxxxxxxxxxxx"
STORAGE_S3_SECRET_ACCESS_KEY: "yyyyyyyyyyyyyyyyyyyyyy"
```

**✓ Object Storage Ready**

---

## Phase 6: Configure Secrets (10 minutes)

### Step 6.1: Create Secrets File

```bash
cd /home/user/crm/k8s
cp secrets.yaml.template secrets.yaml
```

### Step 6.2: Fill in Secrets

Edit `secrets.yaml`:

```yaml
stringData:
  # PostgreSQL (from Phase 3)
  PG_DATABASE_URL: "postgresql://avnadmin:YOUR_PG_PASSWORD@postgresql-xxxxx.priv.cloud.ovh.net:5432/twentycrm?sslmode=require"

  # Redis/Valkey (from Phase 4)
  REDIS_URL: "rediss://default:YOUR_REDIS_PASSWORD@valkey-xxxxx.priv.cloud.ovh.net:6379"

  # Generate random secret
  APP_SECRET: "REPLACE_WITH_OUTPUT_OF_openssl_rand_-hex_32"

  # S3 Storage (from Phase 5)
  STORAGE_S3_ACCESS_KEY_ID: "YOUR_S3_ACCESS_KEY_ID"
  STORAGE_S3_SECRET_ACCESS_KEY: "YOUR_S3_SECRET_ACCESS_KEY"
```

### Step 6.3: Generate APP_SECRET

```bash
# Generate random secret
openssl rand -hex 32

# Copy output and paste into secrets.yaml
```

### Step 6.4: Verify Secrets File

```bash
# Check file exists
ls -la secrets.yaml

# Verify it's NOT tracked by git
git status | grep secrets.yaml
# Should show: nothing (file is gitignored)
```

**✓ Secrets Configured**

---

## Phase 7: Update Configuration (10 minutes)

### Step 7.1: Update ConfigMap with Domains

Edit `k8s/configmap.yaml`:

```yaml
data:
  SERVER_URL: "https://api.yourcrm.com"      # ← CHANGE THIS
  FRONTEND_URL: "https://yourcrm.com"         # ← CHANGE THIS

  STORAGE_S3_NAME: "twenty-crm-files"
  STORAGE_S3_REGION: "gra"                    # ← Your region
  STORAGE_S3_ENDPOINT: "https://s3.gra.cloud.ovh.net"  # ← Your endpoint
```

### Step 7.2: Update Ingress with Domains

Edit `k8s/ingress.yaml`:

```yaml
spec:
  tls:
  - hosts:
    - yourcrm.com              # ← CHANGE THIS
    - api.yourcrm.com          # ← CHANGE THIS

  rules:
  - host: yourcrm.com          # ← CHANGE THIS
  - host: api.yourcrm.com      # ← CHANGE THIS
```

### Step 7.3: Update cert-manager Email

You'll need to update the email in the cert-manager ClusterIssuer:

```bash
# Will be done during deployment, but note your email
YOUR_EMAIL="admin@yourcrm.com"  # ← CHANGE THIS
```

**✓ Configuration Updated**

---

## Summary Checklist

Before proceeding to deployment, verify:

### Infrastructure Created
- [ ] OVHcloud account created and payment method added
- [ ] Kubernetes cluster running (3 nodes Ready)
- [ ] PostgreSQL database running and accessible
- [ ] Redis/Valkey instance running and accessible
- [ ] S3 bucket created with credentials
- [ ] kubectl configured with cluster kubeconfig

### Configuration Files Ready
- [ ] `secrets.yaml` created with all credentials
- [ ] `configmap.yaml` updated with your domains
- [ ] `ingress.yaml` updated with your domains
- [ ] APP_SECRET generated

### Credentials Saved
- [ ] PostgreSQL connection string
- [ ] Redis connection string
- [ ] S3 Access Key ID and Secret
- [ ] Domain names ready (yourcrm.com, api.yourcrm.com)

---

## Cost Summary

**Monthly Recurring Costs** (using recommended configuration):

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| Kubernetes Cluster | MKS Standard | €65 |
| Worker Nodes | 3x B2-15 (4 vCPU, 15GB) | €110 |
| PostgreSQL | Business db1-15 | €30 |
| Redis/Valkey | Business db1-4 | €18 |
| Object Storage | ~100GB + egress | €10 |
| **TOTAL** | | **€233/month** |

**Budget Configuration** (MKS Free + smaller nodes):
- MKS Free: €0
- 3x B2-7 nodes: €60
- Total: **€144/month**

---

## Next Steps

Once all infrastructure is created and configured:

1. **Deploy to Kubernetes**: See `README.md` for deployment instructions
2. **Configure DNS**: Point your domains to the Ingress IP
3. **Verify deployment**: Test frontend, backend, and worker
4. **Set up monitoring**: Optional Prometheus + Grafana

---

## Troubleshooting

### Can't connect to Kubernetes cluster

```bash
# Check kubeconfig path
echo $KUBECONFIG

# Verify file exists
cat $KUBECONFIG | head

# Test connection
kubectl cluster-info
```

### PostgreSQL connection fails

1. Check firewall rules in OVHcloud console
2. Verify SSL mode is enabled (`sslmode=require`)
3. Test with psql directly
4. Check password is correct

### S3 upload fails

1. Verify endpoint URL matches your region
2. Check credentials are correct
3. Verify bucket name is exact match
4. Test with AWS CLI manually

### Need help?

- OVHcloud Support: https://www.ovhcloud.com/en/support/
- OVHcloud Community: https://community.ovh.com/
- Twenty CRM Discord: https://twenty.com/discord

---

**Ready to deploy?** Proceed to `README.md` for Kubernetes deployment steps!
