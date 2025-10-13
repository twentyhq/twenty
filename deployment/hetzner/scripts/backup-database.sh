#!/bin/bash

###########################################
# Twenty CRM - Database Backup Script
# Creates compressed PostgreSQL backups
# with 7-day rotation
###########################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/root/twenty-backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/twenty-db-$TIMESTAMP.sql.gz"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twenty CRM - Database Backup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Change to deployment directory
cd "$DEPLOYMENT_DIR"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env not found${NC}"
    exit 1
fi

# Load environment variables
source .env

echo -e "${BLUE}[1/4] Starting database backup...${NC}"
echo -e "Backup file: ${YELLOW}$BACKUP_FILE${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if database container is running
if ! docker compose -f docker-compose.prod.yml ps db | grep -q "running\|healthy"; then
    echo -e "${RED}Error: Database container is not running${NC}"
    exit 1
fi

# Perform backup
echo -e "${BLUE}[2/4] Creating backup...${NC}"

docker compose -f docker-compose.prod.yml exec -T db pg_dump \
    -U "${PG_DATABASE_USER:-twenty}" \
    -d default \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo -e "  Size: ${YELLOW}$BACKUP_SIZE${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Clean up old backups
echo -e "${BLUE}[3/4] Cleaning up old backups...${NC}"
echo -e "Retention: ${YELLOW}$RETENTION_DAYS days${NC}"

# Find and delete backups older than retention period
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "twenty-db-*.sql.gz" -type f -mtime +$RETENTION_DAYS)

if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read -r file; do
        echo -e "  Deleting: ${YELLOW}$(basename "$file")${NC}"
        rm -f "$file"
    done
    echo -e "${GREEN}✓ Old backups cleaned up${NC}"
else
    echo -e "${GREEN}✓ No old backups to clean up${NC}"
fi

# List current backups
echo -e "${BLUE}[4/4] Current backups:${NC}"
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "twenty-db-*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo -e "  Count: ${YELLOW}$BACKUP_COUNT${NC}"
echo -e "  Total size: ${YELLOW}$TOTAL_SIZE${NC}"
echo ""

# List recent backups
echo -e "${YELLOW}Recent backups:${NC}"
find "$BACKUP_DIR" -name "twenty-db-*.sql.gz" -type f -printf "%T@ %p\n" | \
    sort -rn | \
    head -5 | \
    while read timestamp file; do
        size=$(du -h "$file" | cut -f1)
        date=$(date -d "@${timestamp%.*}" "+%Y-%m-%d %H:%M:%S")
        echo -e "  ${date} - $(basename "$file") - ${size}"
    done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}To restore from this backup:${NC}"
echo -e "1. Stop the application:"
echo -e "   ${BLUE}cd $DEPLOYMENT_DIR${NC}"
echo -e "   ${BLUE}docker compose -f docker-compose.prod.yml down${NC}"
echo ""
echo -e "2. Restore the backup:"
echo -e "   ${BLUE}docker compose -f docker-compose.prod.yml up -d db${NC}"
echo -e "   ${BLUE}gunzip -c $BACKUP_FILE | docker compose -f docker-compose.prod.yml exec -T db psql -U ${PG_DATABASE_USER:-twenty} -d default${NC}"
echo ""
echo -e "3. Start the application:"
echo -e "   ${BLUE}docker compose -f docker-compose.prod.yml up -d${NC}"
echo ""

# Optional: Send backup to remote storage
# Uncomment and configure if you want to send backups to S3, Backblaze B2, etc.
# Example for AWS S3:
# if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
#     echo -e "${BLUE}Uploading to S3...${NC}"
#     aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BACKUP_BUCKET/twenty-backups/"
#     echo -e "${GREEN}✓ Uploaded to S3${NC}"
# fi

echo -e "${YELLOW}Tip:${NC} Set up automated daily backups with cron:"
echo -e "  ${BLUE}crontab -e${NC}"
echo -e "  Add: ${BLUE}0 2 * * * $SCRIPT_DIR/$(basename "$0")${NC}"
echo ""
