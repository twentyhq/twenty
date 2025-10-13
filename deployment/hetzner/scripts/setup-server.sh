#!/bin/bash

###########################################
# Twenty CRM - Initial Server Setup Script
# For Ubuntu 24.04 LTS on Hetzner Cloud
###########################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Twenty CRM - Server Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt update
apt upgrade -y

echo -e "${YELLOW}[2/10] Installing essential packages...${NC}"
apt install -y \
    curl \
    wget \
    git \
    nano \
    vim \
    htop \
    ufw \
    fail2ban \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release

echo -e "${YELLOW}[3/10] Setting up firewall (UFW)...${NC}"
# Configure UFW
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

echo -e "${YELLOW}[4/10] Configuring fail2ban for SSH protection...${NC}"
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}✓ fail2ban configured${NC}"

echo -e "${YELLOW}[5/10] Installing Docker...${NC}"
# Remove old versions if any
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"

echo -e "${YELLOW}[6/10] Setting up swap space (4GB)...${NC}"
# Check if swap already exists
if [ ! -f /swapfile ]; then
    # Create 4GB swap file
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Make swap permanent
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

    # Optimize swap settings
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf

    echo -e "${GREEN}✓ Swap configured (4GB)${NC}"
else
    echo -e "${GREEN}✓ Swap already exists${NC}"
fi

echo -e "${YELLOW}[7/10] Configuring timezone...${NC}"
# Set timezone to UTC (change if needed)
timedatectl set-timezone UTC
echo -e "${GREEN}✓ Timezone set to UTC${NC}"

echo -e "${YELLOW}[8/10] Setting up log rotation...${NC}"
cat > /etc/logrotate.d/twenty <<EOF
/var/log/nginx/twenty-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"

echo -e "${YELLOW}[9/10] Optimizing system settings...${NC}"
# Increase file descriptors
cat >> /etc/security/limits.conf <<EOF
* soft nofile 65536
* hard nofile 65536
EOF

# Network optimizations
cat >> /etc/sysctl.conf <<EOF
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
EOF

sysctl -p

echo -e "${GREEN}✓ System optimizations applied${NC}"

echo -e "${YELLOW}[10/10] Creating directory structure...${NC}"
mkdir -p /root/twenty-backups
mkdir -p /var/www/certbot

echo -e "${GREEN}✓ Directories created${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Server setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Clone the Twenty repository"
echo -e "   ${YELLOW}git clone https://github.com/timberline-tech/twenty.git${NC}"
echo -e "   ${YELLOW}cd twenty/deployment/hetzner${NC}"
echo ""
echo -e "2. Configure environment"
echo -e "   ${YELLOW}cp .env.example .env${NC}"
echo -e "   ${YELLOW}nano .env${NC}"
echo ""
echo -e "3. Deploy the application"
echo -e "   ${YELLOW}./scripts/deploy.sh${NC}"
echo ""
echo -e "4. Set up SSL certificate"
echo -e "   ${YELLOW}./scripts/ssl-setup.sh your-domain.com your-email@example.com${NC}"
echo ""
echo -e "${GREEN}System Information:${NC}"
echo -e "OS: $(lsb_release -d | cut -f2)"
echo -e "Docker: $(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)"
echo -e "Swap: $(free -h | grep Swap | awk '{print $2}')"
echo -e "Firewall: $(ufw status | head -n 1)"
echo ""
