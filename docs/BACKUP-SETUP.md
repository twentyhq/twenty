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
  docker exec -i twenty-db-1 psql -U postgres default

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
