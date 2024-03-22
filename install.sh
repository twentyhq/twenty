#!/bin/bash

# Use environment variables VERSION and BRANCH, with defaults if not set
version=${VERSION:-$(curl -s https://api.github.com/repos/twentyhq/twenty/releases/latest | grep '"tag_name":' | cut -d '"' -f 4)}
branch=${BRANCH:-main}

echo "🚀 Using version $version and branch $branch"

# Create a directory named Twenty
echo "📁 Creating directory 'Twenty'"
mkdir -p Twenty && cd Twenty

# Copy the twenty/packages/twenty-docker/prod/docker-compose.yml file in it
echo "📄 Copying docker-compose.yml"
curl -sLo docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/prod/docker-compose.yml

# Copy twenty/packages/twenty-docker/prod/.env.example to .env
echo "🔧 Setting up .env file"
curl -sLo .env https://raw.githubusercontent.com/twentyhq/twenty/$branch/packages/twenty-docker/prod/.env.example

# Replace TAG=latest by TAG=<latest_release or version input>
sed -i '' "s/TAG=latest/TAG=$version/g" .env

# Generate random strings for secrets
echo "ACCESS_TOKEN_SECRET=$(openssl rand -base64 32)" >> .env
echo "LOGIN_TOKEN_SECRET=$(openssl rand -base64 32)" >> .env
echo "REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)" >> .env

echo "✨ .env configuration completed"

# Ask user if he wants to start the project
read -p "🚀 Do you want to start the project now? (y/N) " answer
if [ "$answer" = "y" ]; then
  echo "🐳 Starting Docker containers..."
  docker compose up -d
  echo "✅ Project started!"
else
  echo "👋 Project setup completed. Run 'docker-compose up -d' to start."
fi
