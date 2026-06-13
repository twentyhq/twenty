# Twenty Real Estate - Setup Guide (Egypt)

## Quick Start

### Option 1: Docker Compose (Recommended for Production)

```bash
# Navigate to docker directory
cd packages/twenty-docker

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3000/api
```

### Option 2: Local Development (Recommended for Customization)

#### Prerequisites Check
```bash
# Verify Node.js version (should be 18+)
node --version

# Verify Yarn version (should be 4+)
yarn --version

# Verify Docker is running
docker --version
```

#### Installation Steps

```bash
# 1. Install dependencies
cd /Users/bashir/workspace/02-Design/twenty-real-estate
yarn install

# 2. Start PostgreSQL and Redis via Docker (optional but recommended)
docker-compose -f packages/twenty-docker/docker-compose.dev.yml up -d db redis

# 3. Configure environment
# Already done: packages/twenty-server/.env is configured

# 4. Initialize database
npx nx run twenty-server:database:init:prod

# 5. Run migrations
npx nx run twenty-server:database:migrate:prod

# 6. Start development servers
# Option A: Start everything (recommended)
yarn start

# Option B: Start individual services
# Terminal 1: Backend
npx nx start twenty-server

# Terminal 2: Frontend
npx nx start twenty-front

# Terminal 3: Worker (optional, for background jobs)
npx nx run twenty-server:worker
```

#### Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **pgAdmin** (if using dev compose): http://localhost:5050

---

## Environment Configuration

### Minimal `.env` for Local Development

Located at: `packages/twenty-server/.env`

```env
NODE_ENV=development
PG_DATABASE_URL=postgres://postgres:***@localhost:5432/twenty_default
REDIS_URL=redis://localhost:6379
SERVER_URL=http://localhost:3000
ENTERPRISE_KEY=twenty-real-estate-dev-key-2026
```

### Production Environment Variables

For production deployments, configure these additional variables:

```env
# Security
ENTERPRISE_KEY=<generate-strong-random-key>

# Email (for notifications)
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Twenty Real Estate

# Analytics (optional)
ANALYTICS_ENABLED=false

# AI Features (optional)
OPENAI_API_KEY=sk-...
AI_MODELS_DEFAULT_FAST=openai/gpt-5-mini
AI_MODELS_DEFAULT_SMART=openai/gpt-5.2
```

---

## Database Management

### Initialize Fresh Database
```bash
# WARNING: This deletes all data
npx nx database:reset twenty-server
```

### Run Migrations
```bash
# Apply pending migrations
npx nx run twenty-server:database:migrate:prod

# Generate a new migration (after entity changes)
npx nx run twenty-server:database:migrate:generate --name add_project_object --type fast
```

### Backup & Restore
```bash
# Backup (PostgreSQL)
docker-compose exec db pg_dump -U postgres default > backup.sql

# Restore
docker-compose exec -T db psql -U postgres default < backup.sql
```

---

## Custom Development Workflow

### 1. Create Custom Object Definition

Location: `packages/twenty-real-estate/objects/project.ts`

```typescript
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'project',
  namePlural: 'projects',
  labelSingular: 'Project',
  labelPlural: 'Projects',
  description: 'Real estate development project',
  fields: [
    { 
      name: 'name', 
      label: 'Project Name', 
      type: FieldType.TEXT,
      isRequired: true 
    },
    { 
      name: 'location', 
      label: 'Location', 
      type: FieldType.TEXT 
    },
    { 
      name: 'startDate', 
      label: 'Start Date', 
      type: FieldType.DATE 
    },
    { 
      name: 'deliveryDate', 
      label: 'Expected Delivery', 
      type: FieldType.DATE 
    },
    { 
      name: 'totalBudget', 
      label: 'Total Budget (EGP)', 
      type: FieldType.CURRENCY,
      options: {
        currency: 'EGP'
      }
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: FieldType.SELECT,
      options: {
        values: ['Planning', 'In Progress', 'Delivered', 'On Hold']
      }
    },
  ],
});
```

### 2. Publish Custom App

```bash
# Publish to your workspace
npx twenty app:publish --private

# Or deploy to production
npx twenty app:publish --public
```

### 3. Test GraphQL Schema

After creating objects, verify the GraphQL schema:

```bash
# Generate TypeScript types from GraphQL schema
npx nx run twenty-front:graphql:generate
```

---

## Egyptian Localization

### Arabic Language Support

1. **Enable RTL in Frontend**
   - Add Arabic locale to `packages/twenty-front/src/languages/`
   - Configure RTL styling in Tailwind config

2. **Bilingual Field Labels**
   ```typescript
   {
     name: 'name',
     label: 'Project Name',
     labelAr: 'اسم المشروع',
     type: FieldType.TEXT
   }
   ```

3. **Egyptian VAT Configuration**
   - Standard rate: 14%
   - Configure tax rules in `packages/twenty-server/src/modules/tax/`

### Phone Number Validation

Egyptian phone format: `+20 1X XXXX XXXX`

```typescript
// Validation utility (to be added to twenty-shared)
function isValidEgyptianPhone(phone: string): boolean {
  const pattern = /^(\+20|0)?1[0-25][0-9]{8}$/;
  return pattern.test(phone.replace(/\s|-/g, ''));
}
```

---

## Testing

### Unit Tests
```bash
# Run backend tests
npx nx test twenty-server

# Run frontend tests
npx nx test twenty-front

# Run specific test file
npx jest packages/twenty-server/src/modules/project/project.service.spec.ts
```

### Integration Tests
```bash
# Reset database and run integration tests
npx nx run twenty-server:test:integration:with-db-reset
```

### E2E Tests
```bash
# Playwright E2E tests
npx nx e2e twenty-e2e-testing
```

---

## Deployment Options

### Self-Hosted (Docker Compose)

```bash
# Production deployment
cd packages/twenty-docker
docker-compose -f docker-compose.yml up -d

# Monitor logs
docker-compose logs -f server
docker-compose logs -f worker
docker-compose logs -f db
```

### Cloud Deployment

**Recommended Providers:**
- Railway.app (easiest, ~$20/month)
- Render.com (good free tier)
- AWS ECS/Fargate (enterprise scale)
- DigitalOcean App Platform

### Hybrid Approach

For Egyptian clients with data residency requirements:
- **Database**: On-premise or local cloud (for data sovereignty)
- **Application**: Cloud-hosted (for scalability)
- **Redis**: Cloud or local (depending on performance needs)

---

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000

# Or use different port
SERVER_URL=http://localhost:4000
```

**2. Database Connection Failed**
```bash
# Verify PostgreSQL is running
docker-compose ps

# Check connection string
echo $PG_DATABASE_URL
```

**3. Yarn Issues**
```bash
# Enable Corepack (Yarn 4)
corepack enable

# Reinstall dependencies
yarn install --frozen-lockfile
```

**4. Migration Errors**
```bash
# Reset and reinitialize
npx nx database:reset twenty-server
npx nx run twenty-server:database:init:prod
```

---

## Next Steps

1. ✅ Fork and clone repository
2. ✅ Create directory structure
3. ✅ Configure environment variables
4. ⏳ Install dependencies and run local setup
5. ⏳ Define first custom object (Project)
6. ⏳ Implement reservation workflow
7. ⏳ Add Egyptian VAT calculation
8. ⏳ Test with pilot users

---

## Resources

- **Twenty Docs**: https://docs.twenty.com
- **GraphQL Schema**: http://localhost:3000/graphql (after starting server)
- **Discord Community**: https://discord.gg/cx5n4Jzs57
- **Project Documentation**: See `docs/` folder

---

**Last Updated**: May 29, 2026  
**Setup by**: Ahmed Hassan