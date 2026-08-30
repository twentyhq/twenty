#!/bin/bash
# Install Docker and Docker Compose on Amazon Linux 2023

set -e

echo "=== Installing Docker and Docker Compose ==="

# Update system
dnf update -y

# Install Docker
dnf install -y docker

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Verify installation
docker --version
docker-compose --version

echo "=== Docker and Docker Compose installed successfully ==="
