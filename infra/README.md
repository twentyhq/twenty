# Twenty CRM — AWS Infrastructure

OpenTofu/Terraform configuration to deploy Twenty CRM on a single EC2 instance in Frankfurt (eu-central-1).

## Architecture

- **EC2 t3.medium** — 2 vCPU, 4 GB RAM, 30 GB gp3 EBS
- **Caddy** — reverse proxy with automatic HTTPS (Let's Encrypt)
- **Docker Compose** — server, worker, PostgreSQL 16, Redis
- **Route 53** — `crm.skilland.ai` → Elastic IP

## Prerequisites

- [OpenTofu](https://opentofu.org/docs/intro/install/) or Terraform >= 1.6
- AWS credentials configured (`aws configure` or env vars)
- An EC2 key pair in eu-central-1 (create in AWS Console → EC2 → Key Pairs)

## Quick Start

```bash
cd infra

# 1. Configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set ssh_key_name at minimum

# 2. Provision infrastructure
tofu init
tofu plan
tofu apply

# 3. Deploy the application (wait ~1 min for EC2 user-data to finish)
chmod +x deploy.sh
./deploy.sh
```

The deploy script will:
- Generate `.env` with random secrets on first run
- Upload configs to the EC2 instance
- Pull Docker images and start all services
- Wait for the server health check

## Updating Twenty CRM

```bash
cd infra

# Pin an exact version (never `latest`): back up first, then go one minor at a time
sed -i 's/TAG=.*/TAG=v2.52.0/' .env
./deploy.sh
```

Read the release's upgrade notes before moving `TAG`; some versions must be crossed in steps.

## API Access (Claude Code Integration)

The GraphQL API is available at `https://crm.skilland.ai/graphql`. To get an API key:

1. Log in to `https://crm.skilland.ai`
2. Go to Settings → Accounts → API Keys
3. Generate a new key

Example query:
```bash
curl -X POST https://crm.skilland.ai/graphql \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ currentWorkspace { displayName } }"}'
```

## Upstream Sync

The GitHub Action `.github/workflows/sync-upstream.yml` runs weekly (Monday 06:00 UTC) to sync from `twentyhq/twenty`. It creates a PR for review. You can also trigger it manually from the Actions tab.

## SSH Access

```bash
ssh ubuntu@$(tofu output -raw instance_ip)

# View logs
cd /opt/twenty && docker compose logs -f server
```

## Destroy

```bash
tofu destroy
```
