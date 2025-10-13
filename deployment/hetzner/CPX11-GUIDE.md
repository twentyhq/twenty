# Twenty CRM on Hetzner CPX11 (2GB RAM)

## Overview

**Can Twenty run on CPX11?** Yes, but with limitations.

### CPX11 Specs
- **2 vCPU** AMD
- **2GB RAM**
- **40GB SSD**
- **€3.79/month** (~$4/month)

### Recommended For
- ✅ **Personal use** (1-3 users)
- ✅ **Testing/Development**
- ✅ **Light workloads** (<1000 records)
- ✅ **Budget constraints**

### NOT Recommended For
- ❌ Team/business use (5+ users)
- ❌ Heavy email/calendar sync
- ❌ Large datasets (>5000 records)
- ❌ Multiple concurrent users
- ❌ Production critical systems

## Memory Comparison

### CPX11 Configuration (2GB RAM)
```
Server:    768MB limit (vs 2GB on CPX21)
Worker:    512MB limit (vs 1GB on CPX21)
Database:  512MB limit (vs 1GB on CPX21)
Redis:     192MB limit (vs 512MB on CPX21)
System:    ~256MB for OS/Nginx
----------------------------------------
Total:     ~2GB
```

### CPX21 Configuration (4GB RAM) - RECOMMENDED
```
Server:    2GB limit
Worker:    1GB limit
Database:  1GB limit
Redis:     512MB limit
System:    ~512MB for OS/Nginx
----------------------------------------
Total:     ~4.5GB
```

## Performance Impact

### What to Expect on CPX11

**Response Times:**
- Simple queries: 200-500ms (vs 100-200ms on CPX21)
- Complex queries: 1-3 seconds (vs 500ms-1s on CPX21)
- Page loads: 2-4 seconds (vs 1-2s on CPX21)

**Limitations:**
- Slower GraphQL queries
- Limited concurrent users (1-2 recommended)
- Background job processing slower
- Email/calendar sync may be delayed
- Database queries use swap (slower)
- Redis evicts data more aggressively

**Stability Risks:**
- Out-of-memory (OOM) kills under heavy load
- Application restarts if memory exceeded
- Slower during backups
- Updates may timeout

## Setup Instructions

### Use the CPX11-Optimized Configuration

When deploying, use the CPX11-specific docker-compose file:

```bash
# Instead of:
./scripts/deploy.sh

# Modify deploy.sh to use:
docker compose -f docker-compose.cpx11.yml up -d
```

Or manually:

```bash
cd /root/twenty/deployment/hetzner

# Use CPX11 configuration
docker compose -f docker-compose.cpx11.yml pull
docker compose -f docker-compose.cpx11.yml down
docker compose -f docker-compose.cpx11.yml up -d
```

### Modified Deploy Script for CPX11

Create a CPX11-specific deploy script:

```bash
cp scripts/deploy.sh scripts/deploy-cpx11.sh
```

Then edit `scripts/deploy-cpx11.sh` and replace:
```bash
docker compose -f docker-compose.prod.yml
```

With:
```bash
docker compose -f docker-compose.cpx11.yml
```

### Swap Space is CRITICAL

The setup script creates 4GB swap. This is **essential** for CPX11:

```bash
# Verify swap is active
swapon --show
# Should show 4GB

# Check swap usage
free -h
```

## Optimizations for CPX11

### 1. Use S3 Storage Instead of Local

Free up local storage and memory:

```bash
# In .env
STORAGE_TYPE=s3
STORAGE_S3_REGION=auto
STORAGE_S3_NAME=your-bucket
STORAGE_S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

Cloudflare R2 offers 10GB free.

### 2. Disable Features You Don't Need

```bash
# In .env
CALENDAR_PROVIDER_GOOGLE_ENABLED=false
MESSAGING_PROVIDER_GMAIL_ENABLED=false
CALENDAR_PROVIDER_MICROSOFT_ENABLED=false
MESSAGING_PROVIDER_MICROSOFT_ENABLED=false
```

### 3. Aggressive Log Rotation

```bash
# Edit /etc/logrotate.d/twenty
/var/log/nginx/twenty-*.log {
    daily
    missingok
    rotate 3  # Keep only 3 days (was 14)
    compress
    delaycompress
    notifempty
}
```

### 4. Monitor Swap Usage

Add to crontab:
```bash
*/10 * * * * [ $(free | grep Swap | awk '{print int($3/$2 * 100)}') -gt 50 ] && echo "High swap usage: $(free -h | grep Swap)" | mail -s "CPX11 Memory Alert" your@email.com
```

## Monitoring on CPX11

Run monitor script more frequently:

```bash
# Check every 5 minutes
*/5 * * * * /root/twenty/deployment/hetzner/scripts/monitor.sh
```

Watch for:
- Swap usage >50% consistently
- OOM killer messages: `dmesg | grep -i "out of memory"`
- Container restarts: `docker compose -f docker-compose.cpx11.yml ps`

## When to Upgrade to CPX21

Signs you need more RAM:

- ⚠️ Frequent OOM kills (`dmesg | grep -i oom`)
- ⚠️ Constant high swap usage (>60%)
- ⚠️ Response times >5 seconds
- ⚠️ Containers restarting frequently
- ⚠️ More than 2-3 concurrent users
- ⚠️ Database growing beyond 1GB

### Upgrading is Easy

Hetzner allows in-place upgrades:

1. **Create snapshot** (€0.012/GB/month - ~€0.50/month for backup)
2. **Upgrade server** in Hetzner console (takes 2-3 minutes)
3. **Switch to CPX21 config**:
   ```bash
   docker compose -f docker-compose.cpx11.yml down
   docker compose -f docker-compose.prod.yml up -d
   ```

## Cost Comparison

| Server | Monthly | RAM | Best For |
|--------|---------|-----|----------|
| **CPX11** | €3.79 ($4) | 2GB | 1-2 users, light use |
| **CPX21** | €4.99 ($5.30) | 4GB | 3-10 users, recommended ✅ |
| **CPX31** | €8.99 ($9.50) | 8GB | 10-25 users, heavy use |

**Extra €1.20/month ($1.30) for CPX21 = 2x RAM, better performance, more stable**

## Real-World Usage Examples

### ✅ Good Fit for CPX11
- Solo entrepreneur managing personal contacts
- Freelancer with 10-50 clients
- Side project / hobby use
- Development/testing environment
- Very small business (1-2 people)

### ❌ Not Suitable for CPX11
- Sales team of 5+ people
- 1000+ contacts with heavy interaction
- Email sync for multiple accounts
- Calendar sync for multiple calendars
- Business-critical CRM

## My Recommendation

**Save the €1.20/month - Go with CPX21**

Here's why:
1. **2x performance** for 26% more cost
2. **No swap thrashing** = faster everything
3. **Room to grow** without migration hassle
4. **More stable** = less downtime
5. **Better user experience**

**€1.20/month = €14.40/year = cost of lunch**

But you get:
- Peace of mind
- Better performance
- No worries about OOM kills
- Can handle growth

## If You Still Choose CPX11

I respect budget constraints! To make it work:

1. ✅ Use the `docker-compose.cpx11.yml` configuration
2. ✅ Use S3 storage (Cloudflare R2 free tier)
3. ✅ Monitor swap usage closely
4. ✅ Keep datasets small (<1000 records)
5. ✅ Limit to 1-2 concurrent users
6. ✅ Plan to upgrade when you hit limits
7. ✅ Regular backups (OOM kills can corrupt data)

## Deployment Command for CPX11

```bash
# Use CPX11 configuration
docker compose -f docker-compose.cpx11.yml up -d

# Or modify deploy.sh:
sed -i 's/docker-compose.prod.yml/docker-compose.cpx11.yml/g' scripts/deploy.sh
./scripts/deploy.sh
```

## Summary

| Factor | CPX11 (2GB) | CPX21 (4GB) |
|--------|-------------|-------------|
| **Cost** | €3.79/month | €4.99/month |
| **Users** | 1-2 | 3-10 |
| **Records** | <1000 | <10000 |
| **Performance** | Adequate | Good |
| **Stability** | Risky | Stable |
| **Production Ready** | No* | Yes ✅ |
| **Recommendation** | Testing only | Production use |

*Can work for very light personal use with close monitoring

## Questions?

If you're unsure, **start with CPX21**. You can always downgrade later (though you probably won't want to after experiencing the better performance).

The €1.20/month difference is negligible for the peace of mind and better user experience.
