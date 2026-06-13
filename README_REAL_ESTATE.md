# Twenty Real Estate - Egyptian Market Edition

## Project Overview

Customized version of Twenty CRM for **Real Estate Developers and Brokers in Egypt**.

### Target Users
1. **Real Estate Developers** - Manage projects, units, reservations, and installments
2. **Real Estate Brokers** - Manage listings, commissions, and client relationships

### Key Customizations (Planned)

#### Custom Objects
- **Project** - Development projects with phases, budgets, and timelines
- **Property/Unit** - Individual units with type, size, finishing level, pricing
- **Reservation** - Client reservations with payment schedules
- **Installment** - Payment plans linked to reservations
- **Commission** - Broker commission tracking and splits

#### Multi-Company Support
- Developers: Multiple project companies under one group
- Brokers: Shared listings with commission splits between brokerages

#### Egyptian Compliance
- VAT (14%) calculation on transactions
- E-invoicing export (Egyptian Tax Authority format)
- Arabic/English bilingual support
- Egyptian phone number validation
- Central Bank reporting templates

#### Integrations (Phase 2)
- Payment gateways: EgyCash, Fawry, Paymob
- Tax Authority portal (ETA)
- SMS providers for client notifications

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (see `.nvmrc`)
- Yarn 4+ (configured via `.yarnrc.yml`)
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Local Development

```bash
# Install dependencies
yarn install

# Start all services (frontend + backend + worker + DB)
yarn start

# Or start individual services
npx nx start twenty-front    # Frontend (port 3001)
npx nx start twenty-server   # Backend API (port 3000)

# Access the app
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# GraphQL Playground: http://localhost:3000/graphql
```

### Database Setup

```bash
# Initialize database
npx nx run twenty-server:database:init:prod

# Run migrations
npx nx run twenty-server:database:migrate:prod

# Reset database (WARNING: destroys all data)
npx nx database:reset twenty-server
```

### Environment Variables

Copy `.env.example` to `.env` in `packages/twenty-server/`:

```bash
cd packages/twenty-server
cp .env.example .env
```

**Minimum required for local dev:**
```env
NODE_ENV=development
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/twenty_default
REDIS_URL=redis://localhost:6379
SERVER_URL=http://localhost:3000
ENTERPRISE_KEY=replace_me_with_a_valid_enterprise_key
```

---

## Custom Object Definitions (To Be Implemented)

### Project Object
```typescript
{
  nameSingular: 'project',
  namePlural: 'projects',
  labelSingular: 'Project',
  labelPlural: 'Projects',
  fields: [
    { name: 'name', label: 'Project Name', type: FieldType.TEXT },
    { name: 'developer', label: 'Developer', type: FieldType.RELATION },
    { name: 'location', label: 'Location', type: FieldType.TEXT },
    { name: 'startDate', label: 'Start Date', type: FieldType.DATE },
    { name: 'deliveryDate', label: 'Expected Delivery', type: FieldType.DATE },
    { name: 'totalBudget', label: 'Total Budget', type: FieldType.CURRENCY },
    { name: 'status', label: 'Status', type: FieldType.SELECT },
  ]
}
```

### Property Object
```typescript
{
  nameSingular: 'property',
  namePlural: 'properties',
  labelSingular: 'Property',
  labelPlural: 'Properties',
  fields: [
    { name: 'project', label: 'Project', type: FieldType.RELATION },
    { name: 'unitNumber', label: 'Unit Number', type: FieldType.TEXT },
    { name: 'type', label: 'Type', type: FieldType.SELECT }, // Apartment, Villa, Townhouse
    { name: 'sizeM2', label: 'Size (m²)', type: FieldType.NUMBER },
    { name: 'finishingLevel', label: 'Finishing', type: FieldType.SELECT }, // Shell & Core, Semi-finished, Fully Finished
    { name: 'priceEGP', label: 'Price (EGP)', type: FieldType.CURRENCY },
    { name: 'status', label: 'Status', type: FieldType.SELECT }, // Available, Reserved, Sold
  ]
}
```

### Reservation Object
```typescript
{
  nameSingular: 'reservation',
  namePlural: 'reservations',
  labelSingular: 'Reservation',
  labelPlural: 'Reservations',
  fields: [
    { name: 'property', label: 'Property', type: FieldType.RELATION },
    { name: 'client', label: 'Client', type: FieldType.RELATION },
    { name: 'reservationDate', label: 'Reservation Date', type: FieldType.DATE_TIME },
    { name: 'totalAmount', label: 'Total Amount', type: FieldType.CURRENCY },
    { name: 'downPayment', label: 'Down Payment', type: FieldType.CURRENCY },
    { name: 'installmentMonths', label: 'Installment Period (Months)', type: FieldType.NUMBER },
    { name: 'status', label: 'Status', type: FieldType.SELECT }, // Pending, Confirmed, Cancelled
  ]
}
```

---

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- [x] Fork and clone Twenty repo
- [ ] Set up local development environment
- [ ] Define custom object schemas
- [ ] Create base migrations

### Phase 2: Core Features (Weeks 3-6)
- [ ] Implement custom objects (Project, Property, Reservation, Installment)
- [ ] Build multi-company isolation (company_id enforcement)
- [ ] Arabic localization (RTL support, Arabic labels)
- [ ] Basic workflows (reservation → installment plan)

### Phase 3: Financial Integration (Weeks 7-9)
- [ ] VAT calculation service (14% Egyptian VAT)
- [ ] Invoice generation from reservations
- [ ] Payment gateway integration (EgyCash mock → production)
- [ ] Receipt generation

### Phase 4: Broker Portal (Weeks 10-12)
- [ ] Commission tracking object
- [ ] Listing management for brokers
- [ ] Client follow-up workflows
- [ ] SMS/email notification templates

### Phase 5: Compliance & Reporting (Weeks 13-14)
- [ ] E-invoicing export (ETA JSON format)
- [ ] Tax authority reports
- [ ] Central Bank template reports
- [ ] Audit logs

### Phase 6: Testing & UAT (Weeks 15-16)
- [ ] Unit tests for custom modules
- [ ] Integration tests for workflows
- [ ] Pilot with 1 developer + 1 broker
- [ ] User feedback incorporation

### Phase 7: Deployment (Week 17)
- [ ] Production deployment (Docker Compose)
- [ ] User training
- [ ] Go-live support

---

## Repository Structure

```
twenty-real-estate/
├── packages/
│   ├── twenty-server/         # Backend API (NestJS)
│   │   ├── src/
│   │   │   ├── modules/       # Custom modules will go here
│   │   │   └── ...
│   │   └── .env               # Environment variables
│   ├── twenty-front/          # Frontend (React)
│   │   └── src/
│   ├── twenty-ui/             # Shared UI components
│   └── twenty-shared/         # Common types and utilities
├── packages/twenty-real-estate/  # Custom real estate module (TO BE CREATED)
│   ├── objects/                # Custom object definitions
│   ├── workflows/              # Automation workflows
│   └── integrations/           # External integrations
└── docs/
    └── REAL_ESTATE_FEATURES.md # Feature documentation
```

---

## Next Steps

1. **Set up local environment** - Run `yarn install` and `yarn start`
2. **Create custom app** - Use `npx create-twenty-app` or extend via modules
3. **Define first object** - Start with `Project` object schema
4. **Test multi-company** - Verify company_id isolation works
5. **Build reservation workflow** - End-to-end test: Property → Reservation → Installments

---

## References

- **Twenty Documentation**: https://docs.twenty.com
- **App Development Guide**: https://docs.twenty.com/developers/extend/apps/getting-started
- **Original Twenty Repo**: https://github.com/twentyhq/twenty
- **Our Fork**: https://github.com/ahmedhabibo/twenty-real-estate

---

**Last Updated**: May 28, 2026
**Project Lead**: Ahmed Hassan, Senior ERP Consultant