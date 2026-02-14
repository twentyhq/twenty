# Twenty CRM - OVHcloud Kubernetes Deployment Guide

This directory contains all the Kubernetes manifests and scripts needed to deploy Twenty CRM to OVHcloud Managed Kubernetes.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **OVHcloud Account** - Sign up at https://www.ovhcloud.com/
2. **kubectl installed** - https://kubernetes.io/docs/tasks/tools/
3. **Domain names** configured:
   - `yourcrm.com` (frontend)
   - `api.yourcrm.com` (backend API)

## 🏗️ Infrastructure Setup (OVHcloud Console)

### Step 1: Create Managed Kubernetes Cluster

1. Go to OVHcloud Console → Public Cloud → Containers & Orchestration → Managed Kubernetes
2. Click "Create a Kubernetes cluster"
3. Configuration:
   - **Name**: `twenty-crm-prod`
   - **Version**: Latest stable (1.28+)
   - **Plan**: MKS Standard (99.99% SLA) or Free (99.5% SLA)
   - **Region**: Choose closest to your users (GRA, SBG, BHS, etc.)
4. **Node Pool**:
   - **Flavor**: B2-15 (4 vCPU, 15GB RAM) recommended
   - **Nodes**: 3 (for high availability)
   - **Auto-scaling**: Enable (min: 3, max: 6)
5. Click "Create cluster"
6. Wait ~10 minutes for cluster provisioning
7. Download kubeconfig file

**Configure kubectl**:
```bash
export KUBECONFIG=~/twenty-crm-kubeconfig.yaml
kubectl get nodes  # Verify connection
```

### Step 2: Create Managed PostgreSQL Database

1. Go to Public Cloud → Databases → Create a database
2. Select **PostgreSQL** (version 15 or 16)
3. Configuration:
   - **Name**: `twenty-crm-db`
   - **Plan**: Business (recommended for production)
   - **Flavor**: db1-15 (4 vCPU, 15GB RAM, 240GB storage)
   - **Region**: Same as your Kubernetes cluster
   - **Network**: Allow access from Kubernetes cluster
4. Create database
5. **Note down**:
   - Connection string (PG_DATABASE_URL)
   - Username and password

### Step 3: Create Managed Valkey (Redis)

1. Go to Public Cloud → Databases → Create a database
2. Select **Valkey** (Redis-compatible, 20% cheaper)
3. Configuration:
   - **Name**: `twenty-crm-redis`
   - **Plan**: Business
   - **Flavor**: db1-4 (1 vCPU, 4GB RAM)
   - **Region**: Same as Kubernetes cluster
   - **Persistence**: RDB + AOF (for queue durability)
4. Create instance
5. **Note down**:
   - Connection string (REDIS_URL)

### Step 4: Create Object Storage (S3-compatible)

1. Go to Public Cloud → Storage → Object Storage
2. Create container:
   - **Name**: `twenty-crm-files`
   - **Region**: Same as Kubernetes cluster (e.g., GRA)
   - **Storage Class**: Standard
3. Create S3 credentials:
   - Go to Users & Roles → Create user
   - Name: `twenty-s3-access`
   - Generate S3 credentials
4. **Note down**:
   - Bucket name
   - Access Key ID
   - Secret Access Key
   - S3 endpoint (e.g., `https://s3.gra.cloud.ovh.net`)

## 🔧 Configuration

### 1. Create Secrets File

```bash
cd k8s
cp secrets.yaml.template secrets.yaml
```

Edit `secrets.yaml` and fill in your credentials:

```yaml
stringData:
  # From OVHcloud PostgreSQL dashboard
  PG_DATABASE_URL: "postgresql://user:pass@postgresql-xxxx.priv.cloud.ovh.net:5432/twentycrm"

  # From OVHcloud Valkey dashboard
  REDIS_URL: "rediss://default:pass@valkey-xxxx.priv.cloud.ovh.net:6379"

  # Generate random 64-char string
  APP_SECRET: "$(openssl rand -hex 32)"

  # From OVHcloud Object Storage
  STORAGE_S3_ACCESS_KEY_ID: "your-access-key-id"
  STORAGE_S3_SECRET_ACCESS_KEY: "your-secret-access-key"
```

**⚠️ IMPORTANT**: Never commit `secrets.yaml` to git! It's already in `.gitignore`.

### 2. Update ConfigMap

Edit `configmap.yaml` and update:

```yaml
data:
  SERVER_URL: "https://api.yourcrm.com"      # Your API domain
  FRONTEND_URL: "https://yourcrm.com"         # Your frontend domain
  STORAGE_S3_NAME: "twenty-crm-files"         # Your bucket name
  STORAGE_S3_REGION: "gra"                    # Your region
  STORAGE_S3_ENDPOINT: "https://s3.gra.cloud.ovh.net"  # Your S3 endpoint
```

### 3. Update Ingress

Edit `ingress.yaml` and update domains:

```yaml
tls:
  - hosts:
    - yourcrm.com              # Your frontend domain
    - api.yourcrm.com          # Your API domain

rules:
  - host: yourcrm.com          # Your frontend domain
  - host: api.yourcrm.com      # Your API domain
```

## 🚀 Deployment

### Prerequisites: Install Ingress Controller & Cert-Manager

```bash
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Install Cert-Manager (for SSL certificates)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager pods to be ready
kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=60s
kubectl wait --for=condition=ready pod -l app=webhook -n cert-manager --timeout=60s

# Create Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourcrm.com  # CHANGE THIS
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Deploy Twenty CRM

#### Option A: Automated Deployment (Recommended)

```bash
./deploy.sh
```

#### Option B: Manual Deployment

```bash
# Create namespace
kubectl create namespace twenty-crm

# Apply manifests in order
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f worker-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
```

## 📊 Verify Deployment

### Check Pod Status

```bash
kubectl get pods -n twenty-crm

# Expected output (all Running):
# NAME                               READY   STATUS    RESTARTS   AGE
# twenty-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
# twenty-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
# twenty-worker-xxxxxxxxxx-xxxxx     1/1     Running   0          2m
# twenty-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
# twenty-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

### Check Logs

```bash
# Backend logs
kubectl logs -f deployment/twenty-backend -n twenty-crm

# Worker logs (should show 17 queues starting)
kubectl logs -f deployment/twenty-worker -n twenty-crm

# Frontend logs
kubectl logs -f deployment/twenty-frontend -n twenty-crm
```

### Check Services

```bash
kubectl get svc -n twenty-crm

# Expected output:
# NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
# twenty-backend-service     ClusterIP   10.x.x.x        <none>        3000/TCP
# twenty-frontend-service    ClusterIP   10.x.x.x        <none>        80/TCP
```

### Get Ingress IP

```bash
kubectl get ingress -n twenty-crm

# Expected output:
# NAME             CLASS   HOSTS                            ADDRESS         PORTS
# twenty-ingress   nginx   yourcrm.com,api.yourcrm.com      x.x.x.x         80, 443
```

**Note the ADDRESS** - this is your Load Balancer IP.

## 🌐 DNS Configuration

Update your DNS records to point to the Ingress IP:

```
Type    Name              Value              TTL
A       yourcrm.com       <INGRESS_IP>       300
A       api.yourcrm.com   <INGRESS_IP>       300
```

**Wait ~5-10 minutes** for DNS propagation and SSL certificate issuance.

## ✅ Test the Deployment

1. **Frontend**: Open https://yourcrm.com in your browser
   - Should load Twenty CRM login page
   - SSL certificate should be valid

2. **Backend API**: Test health endpoint
   ```bash
   curl https://api.yourcrm.com/health
   ```
   - Should return: `{"status":"ok","postgres":true,"redis":true}`

3. **Worker Queues**: Check worker logs
   ```bash
   kubectl logs deployment/twenty-worker -n twenty-crm | grep "Queue"
   ```
   - Should show all 17 queues initialized

## 🔍 Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n twenty-crm

# Check pod logs
kubectl logs <pod-name> -n twenty-crm
```

Common issues:
- **ImagePullBackOff**: Docker image not found (check image name)
- **CrashLoopBackOff**: Application error (check logs)
- **Pending**: Insufficient resources (scale up node pool)

### Database Connection Issues

```bash
# Test from backend pod
kubectl exec -it deployment/twenty-backend -n twenty-crm -- sh
# Inside pod:
psql $PG_DATABASE_URL -c "SELECT 1;"
```

Check:
- PG_DATABASE_URL is correct in secrets
- PostgreSQL allows connections from Kubernetes cluster IPs
- Network policies allow traffic

### SSL Certificate Not Issuing

```bash
# Check certificate status
kubectl get certificate -n twenty-crm

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Describe certificate
kubectl describe certificate twenty-tls-cert -n twenty-crm
```

Common issues:
- DNS not pointing to Ingress IP (cert-manager needs this for HTTP-01 challenge)
- Let's Encrypt rate limit hit (use staging for testing)
- Ingress class not matching

### Worker Not Processing Queues

```bash
# Check worker logs for errors
kubectl logs -f deployment/twenty-worker -n twenty-crm

# Check Redis connection from worker
kubectl exec -it deployment/twenty-worker -n twenty-crm -- sh
# Inside pod:
redis-cli -u $REDIS_URL PING
```

## 📈 Monitoring

### View Resource Usage

```bash
# CPU and Memory usage
kubectl top pods -n twenty-crm

# Node usage
kubectl top nodes
```

### Set Up Prometheus & Grafana (Optional)

```bash
# Install Prometheus + Grafana stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# Open http://localhost:3000 (admin/prom-operator)
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest image and restart pods
kubectl rollout restart deployment/twenty-backend -n twenty-crm
kubectl rollout restart deployment/twenty-worker -n twenty-crm
kubectl rollout restart deployment/twenty-frontend -n twenty-crm

# Check rollout status
kubectl rollout status deployment/twenty-backend -n twenty-crm
```

### Scale Deployments

```bash
# Scale backend to 3 replicas
kubectl scale deployment/twenty-backend --replicas=3 -n twenty-crm

# Scale frontend to 4 replicas
kubectl scale deployment/twenty-frontend --replicas=4 -n twenty-crm
```

### Backup Database

```bash
# Export database
kubectl exec -it deployment/twenty-backend -n twenty-crm -- \
  pg_dump $PG_DATABASE_URL > backup-$(date +%Y%m%d).sql

# Or use OVHcloud automatic backups (configured in PostgreSQL settings)
```

## 💰 Cost Estimate

Based on OVHcloud pricing (as of 2026):

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| Kubernetes Cluster | MKS Standard | €65 |
| Node Pool | 3x B2-15 (4 vCPU, 15GB) | €110 |
| PostgreSQL | Business db1-15 | €30 |
| Valkey (Redis) | Business db1-4 | €18 |
| Object Storage | ~100GB + egress | €10 |
| Load Balancer | Included with K8s | €0 |
| **Total** | | **€233/month** |

**Cost Optimization Tips**:
- Use MKS Free (99.5% SLA) to save €65/month
- Use smaller nodes (B2-7) to save ~€50/month
- Total optimized cost: **€144/month**

## 📚 Additional Resources

- [OVHcloud Managed Kubernetes Docs](https://docs.ovh.com/gb/en/kubernetes/)
- [Twenty CRM Documentation](https://twenty.com/docs)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)

## 🆘 Support

- **OVHcloud Support**: https://www.ovhcloud.com/en/support/
- **Twenty CRM Issues**: https://github.com/twentyhq/twenty/issues
- **Community Discord**: https://twenty.com/discord

## 📝 Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts
2. ✅ Configure automated backups
3. ✅ Set up CI/CD pipeline (GitHub Actions)
4. ✅ Configure Sentry for error tracking
5. ✅ Enable auto-scaling based on load
6. ✅ Set up staging environment
7. ✅ Implement v0 frontend components

---

**Deployed successfully?** 🎉 Share your experience or contribute improvements to these docs!
