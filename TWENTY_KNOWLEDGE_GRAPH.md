# Twenty CRM — Knowledge Graph

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WORKSPACE                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Objects    │──│   Fields    │──│  Relations  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                      │
│  ┌──────▼──────────────▼──────────────▼──────┐                 │
│  │              DATA MODEL                    │                 │
│  │  Standard: People, Companies, Opportunities│                 │
│  │           Tasks, Notes                     │                 │
│  │  Custom: Any user-defined objects          │                 │
│  └───────────────────────────────────────────┘                 │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────┐               │
│  │           API LAYER                          │               │
│  │  REST: /rest/{object}                        │               │
│  │  GraphQL: /graphql                           │               │
│  │  Metadata: /rest/metadata, /metadata         │               │
│  │  Rate limit: 100 req/min, batch: 60 records  │               │
│  └───────────────────────────────────────────┘                 │
│         │                                                       │
│  ┌──────▼──────────────────────────────────────┐               │
│  │           EXTENSIBILITY LAYER                │               │
│  │  Apps (TypeScript packages)                  │               │
│  │  Workflows (no-code/low-code)                │               │
│  │  MCP (Model Context Protocol)                │               │
│  └───────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Objects & Fields Hierarchy

### Standard Objects
| Object        | Purpose                                    | Key Fields                          |
|---------------|--------------------------------------------|-------------------------------------|
| **People**    | Individual contacts                        | Name, Email, Phone, Company (relation) |
| **Companies** | Business accounts/organizations            | Name, Domain, Industry, Size        |
| **Opportunities** | Deals in pipeline                      | Name, Stage, Amount, Company (relation) |
| **Tasks**     | Action items/to-dos                        | Title, Due Date, Assignee, Status   |
| **Notes**     | Free-form text linked to records           | Body, Targets (relation)            |

### Custom Objects

#### Event (`eventInteraction`)
**ID:** `79372027-0463-42ac-b566-b453c90678a0`
**Purpose:** Track events, tradeshows, webinars, conferences, and meetings

| Field | Type | Description |
|-------|------|-------------|
| name | TEXT | Event name/title |
| description | TEXT | Detailed description |
| eventType | SELECT | Tradeshow, Conference, Webinar, Workshop, Dinner, Meeting, Demo, Other |
| startsAt | DATE_TIME | Start date & time |
| endsAt | DATE_TIME | End date & time |
| status | SELECT | Upcoming, In Progress, Completed, Cancelled |
| location | TEXT | Venue name |
| venueAddress | TEXT | Full address |
| city | TEXT | City |
| country | TEXT | Country |
| maxAttendees | NUMBER | Capacity limit |
| budget | NUMBER | Allocated budget |
| actualCost | NUMBER | Actual spend |
| expectedRevenue | CURRENCY | Expected revenue |
| organizer | TEXT | Event organizer |
| contactEmail | TEXT | Inquiry email |
| website | TEXT | Registration link |
| boothVisit | BOOLEAN | Booth visit flag |
| demoGiven | BOOLEAN | Demo delivered flag |
| meetingBooked | BOOLEAN | Follow-up booked flag |
| topicDiscussed | TEXT | Key topics |
| notes | RICH_TEXT | Additional notes |

**Relations:**
| Field | Type | Links To |
|-------|------|----------|
| company | MANY_TO_ONE | Company |
| primaryAttendee | MANY_TO_ONE | Person |
| primaryOpportunity | MANY_TO_ONE | Opportunity |

### Field Types
| Category   | Types                                                              |
|------------|--------------------------------------------------------------------|
| Basic      | Text, Number, Boolean, Date, Currency, Rating, Select              |
| Composite  | Address, Full Name, Links, Phones, Emails                          |
| Special    | Relation, File Attachment, JSON, Actor (createdBy/updatedBy)       |
| System     | id, createdAt, updatedAt, createdBy, position                      |

### Relations
- **MANY_TO_ONE** / **ONE_TO_MANY**: Standard FK relationships
- **MANY_TO_MANY**: Via junction objects
- Bidirectional by default

### Object Relation Map
```
                    ┌─────────────────┐
                    │   Event         │
                    │ (eventInteraction)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │    Company    │ │    Person     │ │  Opportunity  │
    │ (MANY_TO_ONE)│ │ (MANY_TO_ONE)│ │ (MANY_TO_ONE)│
    └───────────────┘ └───────────────┘ └───────────────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    People ←─── Companies
                    (People work at Companies)
                    Opportunities ←─── Companies
                    (Deals belong to Companies)
```

## Workflows System

### Triggers
| Trigger                | Use Case                                      |
|------------------------|-----------------------------------------------|
| Record Created         | New lead processing (CSV, API, sync)          |
| Record Updated         | Data change sync                              |
| Record Created/Updated | Import + manual data handling                 |
| Record Deleted         | Cleanup after deletion                        |
| Manual                 | User-initiated via Cmd+K or button            |
| Schedule (Cron)        | Recurring reports, batch jobs                 |
| Webhook                | External system integration                   |

### Actions
| Action       | Description                                          |
|--------------|------------------------------------------------------|
| Record CRUD  | Create, update, find, delete, upsert records         |
| Send Email   | Send/draft emails from connected accounts            |
| HTTP Request | Call any external API                                |
| Code         | Custom JavaScript for complex logic                  |
| Branch       | If/else conditional logic                            |
| Iterator     | Loop over arrays of records                          |
| AI Agent     | Autonomous AI processing                             |
| Delay        | Wait before continuing                               |
| Form         | Collect user input mid-workflow                      |

### Variables
- Data flows between steps via variables
- Step outputs become available to subsequent steps

## AI Capabilities

### AI Chatbot
- Natural language CRM interaction
- Query records, generate insights

### AI Agents
- Autonomous processing within workflows
- Capabilities: enrichment, classification, summarization, custom prompts
- Use cases: lead scoring, data cleanup, email drafts, record routing

### Permissions
- Roles assigned to AI agents
- Scoped access to objects/fields
- Audit trail for agent actions

## Permissions & Access Control

### Role Hierarchy
```
Admin (highest)
    │
    ├── Custom Roles
    │       ├── Object Permissions (See/Edit/Delete/Destroy)
    │       │       ├── All Objects (default baseline)
    │       │       ├── Object-Level Exceptions
    │       │       └── Field-Level Permissions (See/Edit/No Access)
    │       ├── Row-Level Permissions (Premium)
    │       ├── Settings Permissions
    │       └── Action Permissions (Import/Export/Send Email)
    │
    └── Default Role (assigned to new members)
```

### Role Assignments
- **Workspace Members**: Human users
- **API Keys**: Scoped programmatic access
- **AI Agents**: Scoped AI capabilities

## API Architecture

### Core API (`/rest/` + `/graphql/`)
- CRUD on all objects (standard + custom)
- Batch operations: up to 60 records/request
- GraphQL: batch upserts, relation traversal

### Metadata API (`/rest/metadata` + `/metadata`)
- Schema management: create/modify/delete objects, fields, relations
- Programmatic data model changes

### Authentication
```
Authorization: Bearer YOUR_API_KEY
```
- Created in Settings → API & Webhooks
- Can be scoped to specific roles
- OAuth available for external apps

## Apps System (Developer Extensibility)

### App Entity Types
| Entity              | Purpose                                                    |
|---------------------|------------------------------------------------------------|
| Objects & Fields    | New data tables, fields on existing objects                 |
| Logic Functions     | Server-side TypeScript (HTTP, cron, DB events)             |
| Front Components    | Sandboxed React in Twenty UI                               |
| Skills & Agents     | AI capabilities                                             |
| Views & Navigation  | Pre-configured views, sidebar items                        |

### App Runtime
- **Logic**: Isolated Node.js processes, typed API client
- **Frontend**: Web Workers via Remote DOM (not iframes)
- **Permissions**: Enforced at API level per app role

### Development Flow
```
yarn twenty dev:add    → Scaffold entities
yarn twenty dev:watch  → Live sync to running server
yarn twenty app:publish → Deploy to marketplace/server
```

## Data Migration

### Import Methods
1. **CSV Import**: Via Command Menu (Cmd+K), limit 10k records
2. **API Import**: For large-scale migrations
3. **CRM Migration**: From Salesforce, HubSpot, etc.

### Import Features
- Field mapping
- Duplicate detection (email/domain uniqueness)
- Error handling with UI review
- Relation import via CSV

### Export
- CSV export available for all objects
- No lock-in guarantee

## Layout & Views

### View Types
| Type       | Best For                                    |
|------------|---------------------------------------------|
| Table      | Spreadsheet-like data browsing              |
| Kanban     | Pipeline/stage tracking                     |
| Calendar   | Date-based records                          |

### View Features
- AND/OR filtering
- Multi-field sorting
- Record grouping
- Saved view management
- Access restrictions

## Dashboards & Reporting

### Widget Types
- Charts (bar, line, pie, etc.)
- Metric cards
- Tables
- Filters

### Features
- Real-time data
- Configurable per widget
- Dashboard tabs
- Shareable views

## Integration Points

### Calendar & Email
- **Google Workspace**: Native integration
- **Microsoft 365**: Native integration
- **SMTP/CalDAV**: For other providers
- Auto-creates contacts from interactions

### Webhooks
- Outbound: Record change notifications
- Inbound: Webhook triggers for workflows

### OAuth
- Authorization code flow with PKCE
- Client credentials for server-to-server

## Self-Hosting

### Requirements
- Docker Compose
- PostgreSQL
- Redis

### Commands
```bash
docker compose up -d          # Start
docker compose down           # Stop
docker compose pull && docker compose up -d  # Upgrade
```

### AWS Deployment (EC2)
**Branch:** `production/infra`
**Location:** `aws/`

#### IaC Structure
```
aws/
├── cloudformation/
│   ├── 01-vpc.yaml              # VPC, Subnets, NAT Gateway
│   ├── 02-security.yaml         # Security Groups, IAM Roles
│   ├── 03-rds.yaml              # PostgreSQL RDS
│   ├── 04-elasticache.yaml      # Redis ElastiCache
│   ├── 05-s3.yaml               # S3 File Storage
│   ├── 06-ec2.yaml              # EC2 with Docker
│   ├── 07-alb.yaml              # Application Load Balancer
│   └── master.yaml              # Stack Orchestrator
├── scripts/
│   ├── install-docker.sh        # Docker installation
│   ├── setup-twenty.sh          # Twenty deployment
│   └── backup-cron.sh           # Automated backups
└── config/
    └── .env.example             # Environment template
```

#### Deployment Commands
```bash
# Deploy master stack
aws cloudformation deploy \
  --template-file aws/cloudformation/master.yaml \
  --stack-name twenty-crm \
  --parameter-overrides \
    KeyPairName=your-key-pair \
    ServerUrl=https://your-domain.com \
    EncryptionKey=$(openssl rand -base64 32) \
  --capabilities CAPABILITY_IAM
```

#### Estimated Monthly Cost
- EC2 (t3.medium): ~$30
- RDS (db.t3.micro): ~$25
- ElastiCache (cache.t3.micro): ~$15
- S3 + ALB + Transfer: ~$20
- **Total: ~$90/month**

## Key Concepts Glossary

| Term           | Definition                                                    |
|----------------|---------------------------------------------------------------|
| Workspace      | Company-level container holding all records and settings      |
| Object         | Data structure (table) for a specific entity type             |
| Field          | Property/column on an object                                  |
| Record         | Single instance of an object (row)                            |
| Relation       | Connection between objects                                    |
| View           | Saved filter/sort/layout configuration                        |
| Trigger        | Event that starts a workflow                                  |
| Upsert         | Create-or-update operation                                    |
| Favorite       | Quick-access bookmark in sidebar                              |
| Command Menu   | Cmd+K quick actions interface                                 |
| Custom Object  | User-defined object type                                      |
| Standard Object| Built-in object (People, Companies, etc.)                    |
| Event          | Custom object for tracking events/tradeshows/meetings         |

## Twenty MCP Tools (Available via This Session)

### CRUD Operations
```
find_{object}          → List records with filters
find_one_{object}      → Single record by ID
create_{object}        → Create new record
update_{object}        → Update existing record
delete_{object}        → Delete record
upsert_{object}        → Create or update
```

### Available Objects for CRUD
```
people                 → People/contacts
companies              → Companies/organizations
opportunities          → Deals/pipeline
tasks                  → Tasks/to-dos
notes                  → Notes
eventInteractions      → Events (custom object)
```

### Non-CRUD Tools
```
http_request           → External API calls
send_email             → Email sending
search_people          → People search
search_companies       → Company search
```

### Event Interaction Queries
```
find_eventInteractions                → List events with filters
find_one_eventInteractions            → Single event by ID
create_eventInteractions              → Create new event
update_eventInteractions              → Update event
delete_eventInteractions              → Delete event
```

**Event Filter Examples:**
```
filter: { eventType: { eq: "TRADESHOW" } }
filter: { status: { eq: "UPCOMING" } }
filter: { startsAt: { gte: "2026-01-01" } }
filter: { company: { id: { eq: "company-id" } } }
```

## Documentation URLs

| Topic              | URL                                                           |
|--------------------|---------------------------------------------------------------|
| Introduction       | https://docs.twenty.com/getting-started/introduction          |
| Quickstart         | https://docs.twenty.com/getting-started/quickstart            |
| Data Model         | https://docs.twenty.com/getting-started/core-concepts/data-model |
| Workflows          | https://docs.twenty.com/getting-started/core-concepts/workflows |
| Apps               | https://docs.twenty.com/getting-started/core-concepts/apps    |
| API                | https://docs.twenty.com/developers/extend/api                 |
| AI Agents          | https://docs.twenty.com/user-guide/ai/capabilities/ai-agents |
| Permissions        | https://docs.twenty.com/user-guide/permissions-access/capabilities/permissions |
| Objects            | https://docs.twenty.com/user-guide/data-model/capabilities/objects |
| Workflow Triggers  | https://docs.twenty.com/user-guide/workflows/capabilities/workflow-triggers |
| Full Index         | https://docs.twenty.com/llms.txt                              |
