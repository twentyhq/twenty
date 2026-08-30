# Twenty CRM AWS Deployment Guide

This directory contains Infrastructure as Code (IaC) templates and scripts for deploying Twenty CRM on AWS EC2.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           AWS Cloud                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                        VPC                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │ Public Sub  │  │ Public Sub  │  │             │       │  │
│  │  │   (ALB)     │  │   (NAT)     │  │             │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  │         │                │                │                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │ Private Sub │  │ Private Sub │  │             │       │  │
│  │  │   (EC2)     │  │   (RDS)     │  │ (ElastiCache)│      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
│         │                │                │                      │
│  ┌──────▼──────────────▼──────────────▼──────┐                 │
│  │              Services                      │                 │
│  │  EC2: Twenty CRM (Docker Compose)         │                 │
│  │  RDS: PostgreSQL                          │                 │
│  │  ElastiCache: Redis                       │                 │
│  │  S3: File Storage                         │                 │
│  │  ACM: SSL Certificates                    │                 │
│  └───────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Key Pair** created in AWS for SSH access
4. **Domain Name** (optional, for SSL certificate)
5. **ACM Certificate** (optional, for HTTPS)

## Quick Start

### 1. Deploy with CloudFormation

```bash
# Clone the repository
git clone <repository-url>
cd twenty-crm-aws

# Deploy the master stack
aws cloudformation deploy \
  --template-file cloudformation/master.yaml \
  --stack-name twenty-crm \
  --parameter-overrides \
    KeyPairName=your-key-pair \
    InstanceType=t3.medium \
    DBInstanceClass=db.t3.micro \
    CacheNodeType=cache.t3.micro \
    ServerUrl=https://your-domain.com \
    EncryptionKey=$(openssl rand -base64 32) \
  --capabilities CAPABILITY_IAM
```

### 2. Access Twenty CRM

After deployment (approximately 10-15 minutes):

1. Get the ALB DNS name from the stack outputs:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name twenty-crm \
     --query 'Stacks[0].Outputs[?OutputKey==`ALBDnsName`].OutputValue' \
     --output text
   ```

2. Open the URL in your browser

3. Create your admin account

## Configuration

### Environment Variables

The `.env` file is automatically created during deployment. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SERVER_URL` | Public URL for Twenty CRM | Yes |
| `ENCRYPTION_KEY` | Encryption key for secrets | Yes |
| `PG_DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | No |
| `STORAGE_TYPE` | Storage type (s3 or local) | Yes |

### SSL/HTTPS Setup

1. Request an ACM certificate for your domain
2. Provide the certificate ARN during deployment
3. Configure DNS to point to the ALB DNS name

### Email Configuration

Configure SMTP settings in the Twenty admin panel:

1. Go to Settings → Admin Panel → Configuration Variables
2. Find the Email section
3. Configure SMTP settings for your email provider

## Scripts

### Install Docker
```bash
bash scripts/install-docker.sh
```

### Setup Twenty CRM
```bash
bash scripts/setup-twenty.sh
```

### Backup Database
```bash
bash scripts/backup-cron.sh
```

### Schedule Automated Backups
```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * /home/ec2-user/twenty/backup-cron.sh >> /var/log/twenty-backup.log 2>&1
```

## Cost Estimation

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 | t3.medium | ~$30 |
| RDS | db.t3.micro, Multi-AZ | ~$25 |
| ElastiCache | cache.t3.micro | ~$15 |
| S3 | 10GB + requests | ~$1 |
| ALB | Minimal traffic | ~$10 |
| Data Transfer | 100GB | ~$9 |
| **Total** | | **~$90/month** |

## Monitoring

### CloudWatch Alarms

The stack includes CloudWatch alarms for:
- EC2 CPU utilization
- RDS storage and CPU
- ElastiCache memory

### Logs

View logs in CloudWatch:
```bash
# EC2 logs
aws logs get-log-events --log-group-name /aws/ec2/twenty-crm --log-stream-name <stream-name>

# RDS logs
aws rds download-db-log-file-logs --db-instance-identifier twenty-crm-db
```

## Backup and Restore

### Create Backup
```bash
bash scripts/backup-cron.sh
```

### Restore from Backup
```bash
# Stop Twenty CRM
cd /home/ec2-user/twenty
docker-compose down

# Restore database
docker exec -i twenty-postgres psql -U postgres twenty < /backups/twenty/twenty_db_YYYYMMDD.sql

# Restart Twenty CRM
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **EC2 won't start**
   - Check CloudFormation events for errors
   - Verify security group rules
   - Check IAM role permissions

2. **Database connection failed**
   - Verify RDS security group allows traffic from EC2
   - Check database credentials in Secrets Manager
   - Ensure RDS is in the same VPC

3. **Redis connection failed**
   - Verify ElastiCache security group
   - Check Redis endpoint and port
   - Ensure encryption is enabled

4. **S3 access denied**
   - Verify IAM role has S3 permissions
   - Check bucket policy
   - Ensure bucket exists in the same region

### Logs

```bash
# Check Twenty CRM logs
docker-compose logs -f

# Check specific container
docker-compose logs server
docker-compose logs worker
docker-compose logs postgres
```

## Security Best Practices

1. **Use HTTPS** - Always configure SSL in production
2. **Restrict SSH** - Limit SSH access to specific IP ranges
3. **Enable encryption** - Use encrypted storage and connections
4. **Rotate secrets** - Regularly rotate database passwords and encryption keys
5. **Backup regularly** - Schedule automated backups
6. **Monitor logs** - Set up CloudWatch alarms and log monitoring

## Cleanup

To delete all resources:

```bash
# Delete CloudFormation stacks (in reverse order)
aws cloudformation delete-stack --stack-name twenty-crm
aws cloudformation wait stack-delete-complete --stack-name twenty-crm
```

## Support

For issues with this deployment:
1. Check the [Twenty CRM documentation](https://docs.twenty.com)
2. Review AWS CloudFormation events
3. Check EC2 system logs
4. Open an issue in the repository
