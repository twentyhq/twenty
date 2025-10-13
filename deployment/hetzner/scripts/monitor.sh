#!/bin/bash

###########################################
# Twenty CRM - Monitoring Script
# Checks system health and service status
###########################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DISK_WARNING_THRESHOLD=80
MEMORY_WARNING_THRESHOLD=85
LOG_FILE="/var/log/twenty-monitor.log"

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twenty CRM - System Monitor${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Change to deployment directory
cd "$DEPLOYMENT_DIR"

# Function to check if a value is above threshold
check_threshold() {
    local value=$1
    local threshold=$2
    if [ "$value" -gt "$threshold" ]; then
        return 1
    fi
    return 0
}

# Function to log issues
log_issue() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

ISSUES=0

# ========================================
# 1. Disk Space
# ========================================
echo -e "${BLUE}[1/7] Disk Space:${NC}"

DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
DISK_AVAILABLE=$(df -h / | tail -1 | awk '{print $4}')

if check_threshold "$DISK_USAGE" "$DISK_WARNING_THRESHOLD"; then
    echo -e "  Status: ${GREEN}✓ Healthy${NC}"
else
    echo -e "  Status: ${RED}✗ Warning${NC}"
    log_issue "Disk usage high: ${DISK_USAGE}%"
    ISSUES=$((ISSUES + 1))
fi

echo -e "  Usage: ${YELLOW}${DISK_USAGE}%${NC}"
echo -e "  Available: ${YELLOW}${DISK_AVAILABLE}${NC}"
echo ""

# ========================================
# 2. Memory Usage
# ========================================
echo -e "${BLUE}[2/7] Memory Usage:${NC}"

MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
MEMORY_TOTAL=$(free -h | grep Mem | awk '{print $2}')
MEMORY_USED=$(free -h | grep Mem | awk '{print $3}')
MEMORY_FREE=$(free -h | grep Mem | awk '{print $4}')

if check_threshold "$MEMORY_USAGE" "$MEMORY_WARNING_THRESHOLD"; then
    echo -e "  Status: ${GREEN}✓ Healthy${NC}"
else
    echo -e "  Status: ${RED}✗ Warning${NC}"
    log_issue "Memory usage high: ${MEMORY_USAGE}%"
    ISSUES=$((ISSUES + 1))
fi

echo -e "  Usage: ${YELLOW}${MEMORY_USAGE}%${NC}"
echo -e "  Total: ${YELLOW}${MEMORY_TOTAL}${NC}"
echo -e "  Used: ${YELLOW}${MEMORY_USED}${NC}"
echo -e "  Free: ${YELLOW}${MEMORY_FREE}${NC}"
echo ""

# ========================================
# 3. Docker Services
# ========================================
echo -e "${BLUE}[3/7] Docker Services:${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "  Status: ${RED}✗ Docker is not running${NC}"
    log_issue "Docker is not running"
    ISSUES=$((ISSUES + 1))
else
    echo -e "  Docker: ${GREEN}✓ Running${NC}"

    # Check if compose file exists
    if [ -f docker-compose.prod.yml ]; then
        SERVICES=("db" "redis" "server" "worker")

        for service in "${SERVICES[@]}"; do
            STATUS=$(docker compose -f docker-compose.prod.yml ps "$service" 2>/dev/null | tail -n +2)

            if [ -z "$STATUS" ]; then
                echo -e "  $service: ${RED}✗ Not found${NC}"
                log_issue "Service $service not found"
                ISSUES=$((ISSUES + 1))
            elif echo "$STATUS" | grep -q "Up\|running\|healthy"; then
                echo -e "  $service: ${GREEN}✓ Running${NC}"
            else
                echo -e "  $service: ${RED}✗ Not running${NC}"
                log_issue "Service $service not running"
                ISSUES=$((ISSUES + 1))
            fi
        done
    else
        echo -e "  ${YELLOW}⚠ docker-compose.prod.yml not found${NC}"
    fi
fi
echo ""

# ========================================
# 4. Nginx Status
# ========================================
echo -e "${BLUE}[4/7] Nginx Status:${NC}"

if systemctl is-active --quiet nginx; then
    echo -e "  Status: ${GREEN}✓ Running${NC}"

    # Test configuration
    if nginx -t &> /dev/null; then
        echo -e "  Config: ${GREEN}✓ Valid${NC}"
    else
        echo -e "  Config: ${RED}✗ Invalid${NC}"
        log_issue "Nginx configuration invalid"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "  Status: ${RED}✗ Not running${NC}"
    log_issue "Nginx not running"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# ========================================
# 5. SSL Certificate
# ========================================
echo -e "${BLUE}[5/7] SSL Certificate:${NC}"

CERT_DIRS=$(find /etc/letsencrypt/live -maxdepth 1 -type d ! -path /etc/letsencrypt/live 2>/dev/null)

if [ -n "$CERT_DIRS" ]; then
    for cert_dir in $CERT_DIRS; do
        DOMAIN=$(basename "$cert_dir")
        CERT_FILE="$cert_dir/fullchain.pem"

        if [ -f "$CERT_FILE" ]; then
            EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
            EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
            NOW_EPOCH=$(date +%s)
            DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

            if [ "$DAYS_LEFT" -lt 30 ]; then
                echo -e "  $DOMAIN: ${RED}⚠ Expires in $DAYS_LEFT days${NC}"
                log_issue "SSL certificate for $DOMAIN expires in $DAYS_LEFT days"
                ISSUES=$((ISSUES + 1))
            else
                echo -e "  $DOMAIN: ${GREEN}✓ Valid (${DAYS_LEFT} days left)${NC}"
            fi
        fi
    done
else
    echo -e "  ${YELLOW}⚠ No SSL certificates found${NC}"
fi
echo ""

# ========================================
# 6. Application Health
# ========================================
echo -e "${BLUE}[6/7] Application Health:${NC}"

if [ -f .env ]; then
    source .env

    # Check if SERVER_URL is set
    if [ -n "$SERVER_URL" ]; then
        # Try to access health endpoint
        HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/healthz 2>/dev/null)

        if [ "$HEALTH_RESPONSE" = "200" ]; then
            echo -e "  Health Check: ${GREEN}✓ Passed${NC}"
        else
            echo -e "  Health Check: ${RED}✗ Failed (HTTP $HEALTH_RESPONSE)${NC}"
            log_issue "Application health check failed: HTTP $HEALTH_RESPONSE"
            ISSUES=$((ISSUES + 1))
        fi
    else
        echo -e "  ${YELLOW}⚠ SERVER_URL not configured${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠ .env not found${NC}"
fi
echo ""

# ========================================
# 7. Docker Resource Usage
# ========================================
echo -e "${BLUE}[7/7] Container Resource Usage:${NC}"

if docker info > /dev/null 2>&1; then
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -n 5
else
    echo -e "  ${RED}✗ Cannot get Docker stats${NC}"
fi
echo ""

# ========================================
# Summary
# ========================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Summary${NC}"
echo -e "${GREEN}========================================${NC}"

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational${NC}"
else
    echo -e "${RED}✗ Found $ISSUES issue(s)${NC}"
    echo -e "Check log: ${YELLOW}$LOG_FILE${NC}"
fi

echo ""
echo -e "${YELLOW}Recent Logs:${NC}"
if [ -f "$LOG_FILE" ]; then
    tail -5 "$LOG_FILE"
else
    echo -e "  No logs yet"
fi

echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:         ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  Restart services:  ${BLUE}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "  Check status:      ${BLUE}docker compose -f docker-compose.prod.yml ps${NC}"
echo -e "  Backup database:   ${BLUE}./scripts/backup-database.sh${NC}"
echo ""

# Exit with error code if there are issues
exit $ISSUES
