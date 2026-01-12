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
