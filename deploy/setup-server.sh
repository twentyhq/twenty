#!/bin/bash
# Controlit CRM - Server Setup Script
# Run this on a fresh Ubuntu 22.04/24.04 VPS

set -e

echo "==================================="
echo "Controlit CRM - Server Setup"
echo "==================================="

# Update system
echo "[1/6] Updating system..."
apt update && apt upgrade -y

# Install Docker
echo "[2/6] Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose plugin
echo "[3/6] Installing Docker Compose..."
apt install -y docker-compose-plugin

# Install other utilities
echo "[4/6] Installing utilities..."
apt install -y curl nginx certbot python3-certbot-nginx ufw

# Setup firewall
echo "[5/6] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Create app directory
echo "[6/6] Creating application directory..."
mkdir -p /opt/controlit-crm
cd /opt/controlit-crm

echo ""
echo "==================================="
echo "Server setup complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Copy docker-compose.prod.yml to /opt/controlit-crm/"
echo "2. Copy .env file to /opt/controlit-crm/"
echo "3. Run: cd /opt/controlit-crm && docker compose -f docker-compose.prod.yml up -d"
echo "4. Configure Nginx and SSL"
echo ""
