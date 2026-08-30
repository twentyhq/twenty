#!/bin/bash
# Automated backup script for Twenty CRM

set -e

# Configuration
BACKUP_DIR="/backups/twenty"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "=== Starting Twenty CRM backup ==="
echo "Date: $DATE"

# Backup PostgreSQL
echo "Backing up PostgreSQL database..."
docker exec twenty-postgres pg_dump -U postgres twenty > "$BACKUP_DIR/twenty_db_$DATE.sql"

# Backup Redis (optional - for persistent data)
echo "Backing up Redis data..."
docker exec twenty-redis redis-cli BGSAVE > /dev/null 2>&1 || true

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/twenty_db_$DATE.sql"

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"

echo "=== Backup completed successfully ==="
