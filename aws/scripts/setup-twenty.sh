#!/bin/bash
# Setup Twenty CRM on EC2 instance

set -e

echo "=== Setting up Twenty CRM ==="

# Configuration
TWENTY_DIR="/home/ec2-user/twenty"
cd "$TWENTY_DIR"

# Download docker-compose.yml
echo "Downloading docker-compose.yml..."
curl -o docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/docker-compose.yml

# Get parameters from environment (set by CloudFormation)
DB_ENDPOINT="${DB_ENDPOINT:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-twenty}"
REDIS_ENDPOINT="${REDIS_ENDPOINT:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
S3_BUCKET="${S3_BUCKET:-}"
SERVER_URL="${SERVER_URL:-http://localhost:3000}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"

# Get DB password from Secrets Manager
if [ -n "$DB_SECRET_ARN" ]; then
    echo "Fetching database credentials from Secrets Manager..."
    DB_CREDENTIALS=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query 'SecretString' --output text)
    DB_USERNAME=$(echo "$DB_CREDENTIALS" | jq -r '.username')
    DB_PASSWORD=$(echo "$DB_CREDENTIALS" | jq -r '.password')
else
    echo "Using default database credentials..."
    DB_USERNAME="twentyadmin"
    DB_PASSWORD="${DB_PASSWORD:-}"
fi

# Generate encryption key if not provided
if [ -z "$ENCRYPTION_KEY" ]; then
    echo "Generating encryption key..."
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    echo "Generated encryption key: $ENCRYPTION_KEY"
fi

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
# Server Configuration
SERVER_URL=$SERVER_URL
PORT=3000

# Database Configuration
PG_DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:$DB_PORT/$DB_NAME
PG_DATABASE_PASSWORD=$DB_PASSWORD

# Redis Configuration
REDIS_URL=redis://$REDIS_ENDPOINT:$REDIS_PORT

# Security
ENCRYPTION_KEY=$ENCRYPTION_KEY
LOGIN_TOKEN_EMAIL=\{SERIES_NUMBER\}
LOGIN_TOKEN_KEY=\{SERIES_NUMBER\}

# Storage
STORAGE_TYPE=s3
STORAGE_S3_REGION=${AWS_REGION:-us-east-1}
STORAGE_S3_BUCKET=$S3_BUCKET

# Application
IS_CONFIG_VARIABLES_IN_DB_ENABLED=true
IS_MULTIWORKSPACE_ENABLED=false

# Logging
NODE_ENV=production
LOG_LEVEL=info
EOF

echo "=== Twenty CRM setup complete ==="
echo "Starting Twenty CRM..."

# Start Twenty CRM
docker-compose up -d

echo "=== Twenty CRM is now running ==="
echo "Access it at: $SERVER_URL"
