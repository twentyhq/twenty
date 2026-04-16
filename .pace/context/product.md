# Product Context — Twenty CRM

## Vision

Twenty is an **open-source CRM** designed to break the vendor lock-in and poor UX of legacy CRM systems. The product enables businesses to manage customer relationships with:

1. **Flexible data modeling** — Users can define custom objects, fields, and relations like Airtable/Notion
2. **Modern UX** — Inspired by Linear, Notion, Airtable: keyboard-first, fast, beautiful
3. **Workflow automation** — Trigger-action workflows to automate sales/support processes
4. **Multi-channel engagement** — Email sync, calendar integration, file attachments
5. **Self-hosting** — Full data ownership via Docker Compose or Kubernetes

**Core Value Propositions:**
- **No vendor lock-in**: Open-source (AGPL-3.0), exportable data, self-hostable
- **Customizable**: Dynamic schema allows teams to model their unique sales processes
- **Developer-friendly**: GraphQL API, REST API, SDKs (Node.js, Zapier), webhooks
- **Beautiful**: Polished UI rivaling SaaS products like Linear/Notion
- **Community-driven**: 100s of contributors, plugin ecosystem (planned)

## Target Personas

### 1. **Self-Hosting Enthusiast** (DevOps/SysAdmin)
- **Pain**: Wants CRM but refuses vendor lock-in; needs data sovereignty
- **Needs**: Easy Docker Compose setup, Kubernetes Helm charts, clear migration docs
- **Success**: Deploys Twenty in <30 minutes, integrates with company SSO/LDAP

### 2. **Startup Founder / Sales Lead**
- **Pain**: Salesforce/HubSpot too expensive for small team; spreadsheets don't scale
- **Needs**: Simple CRM for leads/contacts/deals, email integration, free tier
- **Success**: Onboards team in <1 hour, syncs Gmail/Outlook, closes first deal in Twenty

### 3. **Developer / API User**
- **Pain**: Existing CRMs have poor APIs, can't extend functionality
- **Needs**: GraphQL/REST APIs, webhooks, Zapier integration, plugin system
- **Success**: Builds custom workflow (e.g., auto-enrich leads with Clearbit) in <1 day

### 4. **Growth Hacker / Operations**
- **Pain**: Needs to customize CRM to match unique funnel stages, can't in Salesforce
- **Needs**: Custom objects/fields, workflow automation, reports/dashboards
- **Success**: Creates "Product Qualified Lead" object with custom scoring, automates Slack notifications

### 5. **Open-Source Contributor**
- **Pain**: Wants to contribute to meaningful project, learn modern stack
- **Needs**: Good docs, welcoming community, clear issues labeled "good first issue"
- **Success**: Submits first PR fixing a UI bug, becomes regular contributor

## MVP Scope

### ✅ **In Scope** (Current Release)

#### Core CRM Features
- **Standard Objects**: Companies, People, Opportunities (Deals), Tasks, Notes
- **Custom Objects**: Users can define new object types (e.g., "Products", "Support Tickets")
- **Custom Fields**: Add fields of types: Text, Number, Date, Relation, Select, Multi-Select, Boolean, Link, Email, Phone
- **Relations**: Many-to-One, One-to-Many (Many-to-Many via junction objects)

#### Views & Filters
- **Table View**: Spreadsheet-like grid with inline editing
- **Kanban View**: Drag-drop cards by status/stage
- **Filters**: Complex filters (AND/OR), saved views
- **Sorting & Grouping**: Multi-level sort, group by field

#### Integrations
- **Email Sync**: Gmail, Outlook (IMAP/OAuth)
- **Calendar Sync**: Google Calendar, Microsoft Calendar (read-only events)
- **File Attachments**: Upload files (local storage or S3)
- **Zapier**: Connect to 3000+ apps

#### Automation
- **Workflows**: Trigger-action automations (e.g., "When deal stage changes to Closed Won → Send Slack message")
- **Webhooks**: Outbound webhooks on record create/update/delete

#### Permissions
- **Custom Roles**: Define roles with granular permissions (read/write/admin per object)
- **Workspace Members**: Invite users, assign roles

#### API & Developer Tools
- **GraphQL API**: Query/mutate all objects
- **Metadata API**: Manage schema (create objects, fields) via API
- **REST API**: RESTful interface auto-generated from GraphQL
- **SDK**: Node.js SDK (`twenty-sdk`)
- **CLI Scaffolding**: `create-twenty-app` to bootstrap new integrations

#### Self-Hosting
- **Docker Compose**: One-command deploy (`docker compose up`)
- **Kubernetes**: Helm charts for production
- **Database Migrations**: Auto-run on startup or manual control

### ❌ **Out of Scope** (Future Roadmap)

#### Advanced Features
- **Plugin Marketplace**: Not yet launched (plugins can be built, no public registry)
- **AI Features**: Basic AI integrations exist (e.g., code interpreter) but not full AI assistant
- **Mobile Apps**: Web is responsive, but no native iOS/Android apps
- **Advanced Reporting**: Basic charts via Nivo, but no pivot tables / advanced BI
- **Revenue Operations**: No native quote/invoice generation (can be custom objects)
- **Multi-Workspace SaaS**: Self-hosted only; no official managed cloud (yet)

#### Integrations
- **Slack App**: Can send webhooks, but no interactive Slack app
- **Salesforce Migration**: No automated import from Salesforce
- **Twilio/SMS**: No native SMS integration (can use webhooks + Zapier)

## Success Metrics

### Product Adoption
- **GitHub Stars**: Measure community interest (current: thousands)
- **Docker Pulls**: Track self-hosting adoption (twentycrm/twenty image)
- **Active Workspaces**: Number of self-hosted instances (if telemetry enabled)

### User Engagement
- **DAU/WAU**: Daily/Weekly active users in a workspace
- **Objects Created**: Number of custom objects defined (indicates customization)
- **Records Created**: Total companies/people/opportunities created
- **Workflows Executed**: Number of automation runs (indicates power-user adoption)

### Developer Ecosystem
- **API Calls**: GraphQL/REST API usage (indicates integrations)
- **Zapier Installs**: Number of users connecting Twenty to Zapier
- **SDK Downloads**: `npm install twenty-sdk` count
- **Contributors**: Active monthly contributors on GitHub

### Performance
- **Time to First Value**: User creates first company/deal within 10 minutes of signup
- **GraphQL Query Latency**: P95 < 200ms for core queries
- **Uptime**: 99.9% uptime for self-hosted instances (health check success rate)

### Community Health
- **Discord Members**: Size of community (users helping users)
- **Issue Resolution Time**: Median time to close "good first issue" (encourage contributions)
- **PR Merge Rate**: % of community PRs merged (welcoming contributors)

## Strategic Constraints

### ✅ **Locked Decisions** (Do Not Change)

#### 1. **Open Source Commitment (AGPL-3.0)**
- **Rationale**: Core mission is anti-vendor-lock-in; commercial forks must open-source
- **Implication**: No "enterprise-only" features in closed-source add-ons (all features in main repo)

#### 2. **Self-Hosting First**
- **Rationale**: Users own their data, no forced cloud migration
- **Implication**: All features must work in Docker Compose / on-prem Kubernetes (no cloud-only dependencies)

#### 3. **GraphQL Primary API**
- **Rationale**: Enables dynamic schema from custom objects, better DX than REST
- **Implication**: REST API is auto-generated from GraphQL (GraphQL is source of truth)

#### 4. **PostgreSQL as Primary DB**
- **Rationale**: Mature, open-source, supports complex queries for CRM
- **Implication**: No MongoDB/NoSQL; schema changes via TypeORM migrations

#### 5. **Monorepo (Nx + Yarn Workspaces)**
- **Rationale**: Share code between server/front/SDKs, enforce consistency
- **Implication**: New features must follow Nx patterns (libraries, apps, project.json targets)

#### 6. **Multi-Tenancy via PostgreSQL Schemas**
- **Rationale**: Strong data isolation for workspaces, easier to backup/restore per-workspace
- **Implication**: Cannot use shared tables for workspace data (metadata is per-schema)

#### 7. **Modern Tech Stack**
- **Rationale**: Attract developers, leverage latest performance improvements
- **Implication**: Node 24+, TypeScript 5.9+, React 18+ (no legacy support)

#### 8. **Storybook for Component Development**
- **Rationale**: Design system (`twenty-ui`) must be documented and tested
- **Implication**: All UI components require stories, visual regression tests

### 🤔 **Open for Discussion**

#### 1. **Managed Cloud Offering**
- **Question**: Should Twenty offer a hosted SaaS version?
- **Tradeoff**: Revenue vs. staying true to self-hosting mission

#### 2. **Plugin Approval Process**
- **Question**: How to ensure plugin quality in a marketplace?
- **Tradeoff**: Open ecosystem vs. security/quality guarantees

#### 3. **AI Feature Scope**
- **Question**: How deep should AI integrations go (copilot, auto-enrichment, etc.)?
- **Tradeoff**: Competitive with AI-first CRMs vs. simplicity

#### 4. **Breaking Changes Cadence**
- **Question**: How often can we break self-hosted APIs for improvements?
- **Tradeoff**: Innovation speed vs. stability for existing users

#### 5. **Real-Time Collaboration**
- **Question**: Should Twenty have Notion-like multiplayer (live cursors, presence)?
- **Tradeoff**: Complexity (WebSockets, conflict resolution) vs. UX delight

---

**Product Philosophy**: "Build a CRM people actually **enjoy** using, with the transparency and flexibility of open source."
