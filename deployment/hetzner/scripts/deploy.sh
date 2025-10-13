#!/bin/bash

###########################################
# Twenty CRM - Deployment Script
# Deploys or updates the application
###########################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twenty CRM - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Change to deployment directory
cd "$DEPLOYMENT_DIR"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production not found${NC}"
    echo -e "Please create .env.production from .env.production.example"
    exit 1
fi

echo -e "${BLUE}[1/7] Loading environment variables...${NC}"
source .env.production

# Validate required environment variables
REQUIRED_VARS=("SERVER_URL" "APP_SECRET" "PG_DATABASE_PASSWORD")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "  - ${RED}$var${NC}"
    done
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"

echo -e "${BLUE}[2/7] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"

echo -e "${BLUE}[3/7] Pulling latest Docker images...${NC}"
docker compose -f docker-compose.prod.yml pull

echo -e "${GREEN}✓ Docker images updated${NC}"

echo -e "${BLUE}[4/7] Stopping existing containers (if any)...${NC}"
docker compose -f docker-compose.prod.yml down || true

echo -e "${GREEN}✓ Containers stopped${NC}"

echo -e "${BLUE}[5/7] Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✓ Services started${NC}"

echo -e "${BLUE}[6/7] Waiting for services to be healthy...${NC}"

# Function to check service health
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker compose -f docker-compose.prod.yml ps $service | grep -q "healthy\|running"; then
            echo -e "${GREEN}✓ $service is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}Waiting for $service... (attempt $attempt/$max_attempts)${NC}"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo -e "${RED}✗ $service failed to become healthy${NC}"
    return 1
}

# Wait for database
check_health "db"

# Wait for Redis
check_health "redis"

# Wait for server
check_health "server"

# Wait for worker
check_health "worker"

echo -e "${BLUE}[7/7] Verifying deployment...${NC}"

# Show container status
echo ""
echo -e "${YELLOW}Container Status:${NC}"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${YELLOW}Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application URL: ${YELLOW}${SERVER_URL}${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:     ${BLUE}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  View server:   ${BLUE}docker compose -f docker-compose.prod.yml logs -f server${NC}"
echo -e "  View worker:   ${BLUE}docker compose -f docker-compose.prod.yml logs -f worker${NC}"
echo -e "  Restart:       ${BLUE}docker compose -f docker-compose.prod.yml restart${NC}"
echo -e "  Stop:          ${BLUE}docker compose -f docker-compose.prod.yml down${NC}"
echo -e "  Status:        ${BLUE}docker compose -f docker-compose.prod.yml ps${NC}"
echo ""

# Check if Nginx is configured
if [ ! -f /etc/nginx/sites-enabled/twenty ]; then
    echo -e "${YELLOW}⚠ Nginx is not configured yet${NC}"
    echo -e "To configure Nginx and SSL:"
    echo -e "  1. ${BLUE}apt install -y nginx${NC}"
    echo -e "  2. ${BLUE}cp nginx/twenty.conf /etc/nginx/sites-available/twenty${NC}"
    echo -e "  3. ${BLUE}ln -s /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/${NC}"
    echo -e "  4. ${BLUE}sed -i 's/your-domain.com/${DOMAIN}/g' /etc/nginx/sites-available/twenty${NC}"
    echo -e "  5. ${BLUE}nginx -t && systemctl restart nginx${NC}"
    echo -e "  6. ${BLUE}./scripts/ssl-setup.sh ${DOMAIN} your-email@example.com${NC}"
    echo ""
fi

# Show next steps
echo -e "${YELLOW}Next steps:${NC}"
if [ ! -f /etc/letsencrypt/live/*/fullchain.pem ]; then
    echo -e "  1. Set up SSL: ${BLUE}./scripts/ssl-setup.sh ${DOMAIN} your-email@example.com${NC}"
else
    echo -e "  ${GREEN}✓ SSL is already configured${NC}"
fi

echo -e "  2. Set up backups: ${BLUE}crontab -e${NC} and add:"
echo -e "     ${BLUE}0 2 * * * $DEPLOYMENT_DIR/scripts/backup-database.sh${NC}"
echo ""
echo -e "  3. Monitor: ${BLUE}./scripts/monitor.sh${NC}"
echo ""
