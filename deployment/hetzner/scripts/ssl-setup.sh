#!/bin/bash

###########################################
# Twenty CRM - SSL Certificate Setup
# Sets up Let's Encrypt SSL with Certbot
###########################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twenty CRM - SSL Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Usage: $0 <domain> <email>${NC}"
    echo -e "Example: $0 example.com admin@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo -e "${YELLOW}Domain:${NC} $DOMAIN"
echo -e "${YELLOW}Email:${NC} $EMAIL"
echo ""

# Validate domain format (supports subdomains)
if [[ ! $DOMAIN =~ ^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}Error: Invalid domain format${NC}"
    exit 1
fi

# Validate email format
if [[ ! $EMAIL =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}Error: Invalid email format${NC}"
    exit 1
fi

echo -e "${BLUE}[1/6] Checking Nginx installation...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Error: Nginx is not installed${NC}"
    echo -e "Install with: ${YELLOW}apt install -y nginx${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Nginx is installed${NC}"

echo -e "${BLUE}[2/6] Installing Certbot...${NC}"
apt update
apt install -y certbot python3-certbot-nginx

echo -e "${GREEN}✓ Certbot installed${NC}"

echo -e "${BLUE}[3/6] Creating certbot directory...${NC}"
mkdir -p /var/www/certbot

echo -e "${GREEN}✓ Directory created${NC}"

echo -e "${BLUE}[4/6] Testing Nginx configuration...${NC}"
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Nginx configuration test failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Nginx configuration is valid${NC}"

echo -e "${BLUE}[5/6] Obtaining SSL certificate...${NC}"
echo -e "${YELLOW}This will request a certificate from Let's Encrypt${NC}"
echo ""

# Stop nginx temporarily
systemctl stop nginx

# Obtain certificate using standalone mode
certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domain "$DOMAIN" \
    --domain "www.$DOMAIN"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to obtain SSL certificate${NC}"
    systemctl start nginx
    exit 1
fi

echo -e "${GREEN}✓ SSL certificate obtained${NC}"

echo -e "${BLUE}[6/6] Configuring Nginx with SSL...${NC}"

# Update Nginx configuration with actual domain
sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/twenty

# Test Nginx configuration again
nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Nginx configuration test failed after SSL setup${NC}"
    exit 1
fi

# Start Nginx
systemctl start nginx
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configured and restarted${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Certificate Details:${NC}"
certbot certificates

echo ""
echo -e "${YELLOW}Your site is now accessible at:${NC}"
echo -e "  ${GREEN}https://$DOMAIN${NC}"
echo -e "  ${GREEN}https://www.$DOMAIN${NC}"
echo ""

echo -e "${YELLOW}Certificate Auto-Renewal:${NC}"
echo -e "Certbot will automatically renew your certificate before it expires."
echo -e "You can test renewal with:"
echo -e "  ${BLUE}certbot renew --dry-run${NC}"
echo ""

# Set up auto-renewal timer (should be automatic with certbot package)
echo -e "${BLUE}Setting up auto-renewal...${NC}"

# Create renewal hook to reload nginx
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Test renewal
echo -e "${YELLOW}Testing certificate renewal (dry run)...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Certificate renewal test passed${NC}"
else
    echo -e "${YELLOW}⚠ Certificate renewal test had issues, but SSL is working${NC}"
fi

echo ""
echo -e "${YELLOW}Certificate will expire on:${NC}"
certbot certificates | grep "Expiry Date" | head -n 1

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "1. Visit ${BLUE}https://$DOMAIN${NC} to access your Twenty CRM instance"
echo -e "2. Create an account and start using Twenty CRM"
echo -e "3. Set up automated backups: ${BLUE}./scripts/backup-database.sh${NC}"
echo ""
