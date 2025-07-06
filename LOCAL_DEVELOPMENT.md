# Local Development Setup Guide

This guide will help you set up Twenty CRM for local development.

## Prerequisites

- Node.js v22.12.0
- Yarn v4.0.2 or higher
- PostgreSQL
- Redis

## Step-by-Step Setup

### 1. Clone the Repository
```bash
git clone https://github.com/stix26/twenty.git
cd twenty
```

### 2. Node.js Setup
```bash
# Install nvm if you haven't already
nvm install 22.12.0
nvm use 22.12.0
```

### 3. Yarn Setup
```bash
corepack enable
corepack prepare yarn@4.0.2 --activate
```

### 4. Install Dependencies
```bash
yarn install
```

### 5. Environment Configuration

#### Frontend Setup
```bash
cp packages/twenty-front/.env.example packages/twenty-front/.env
```

#### Backend Setup
```bash
cp packages/twenty-server/.env.example packages/twenty-server/.env
```

### 6. Database Setup

#### PostgreSQL
1. Install PostgreSQL using Homebrew:
```bash
brew install postgresql@14
brew services start postgresql@14
```

2. Create the database:
```bash
createdb twenty
```

#### Redis
1. Install and start Redis:
```bash
brew install redis
brew services start redis
```

### 7. Build and Run

#### Backend (Port 3000)
```bash
cd packages/twenty-server
yarn start:prod
```

#### Frontend (Port 3001)
```bash
cd packages/twenty-front
npx serve -s build -l 3001
```

## Common Issues and Troubleshooting

1. **Node Version Mismatch**
   - Make sure you're using Node.js v22.12.0
   - Use `nvm use 22.12.0` to switch versions

2. **Port Conflicts**
   - Ensure ports 3000 and 3001 are available
   - Check for running processes: `lsof -i :3000` or `lsof -i :3001`

3. **Database Connection Issues**
   - Verify PostgreSQL is running: `brew services list`
   - Check database existence: `psql -l`

4. **Redis Connection Issues**
   - Verify Redis is running: `redis-cli ping`
   - Should return "PONG"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For additional help, please:
1. Check the GitHub issues
2. Join the community Discord
3. Review the official documentation
