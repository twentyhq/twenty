# Product Context - Twenty CRM

## Vision

Twenty is the #1 open-source CRM designed to free users from vendor lock-in and expensive pricing tiers. It provides a modern, extensible customer relationship management platform that teams can self-host or use as a service, with full control over their customer data.

### Core Value Propositions
1. **Open-source freedom**: No vendor lock-in, full data ownership, community-driven development
2. **Modern UX**: Clean, fast interface inspired by Notion, Airtable, and Linear
3. **Extensibility**: Plugin architecture, custom objects/fields, workflow automation
4. **Affordable**: Self-hosting eliminates SaaS pricing escalation

### Problem Statement
Traditional CRMs (Salesforce, HubSpot) trap users with locked-in customer data and escalating costs. Teams need a CRM that:
- Gives them full control over their data
- Provides a delightful, modern user experience
- Allows deep customization without vendor constraints
- Scales affordably

## Target Personas

### Primary: Growth-Stage Startups (50-500 employees)
- **Pain Points**:
  - Outgrowing simple tools (Notion, spreadsheets) but can't afford enterprise CRM pricing
  - Need custom objects/fields for unique business models
  - Want to self-host for data sovereignty
- **Jobs to Be Done**:
  - Track customer interactions across sales, support, success
  - Build custom workflows without developer bottlenecks
  - Integrate with existing tools (Zapier, APIs)
- **Success Metrics**:
  - Reduce time-to-value (setup in hours, not weeks)
  - Lower total cost of ownership vs. Salesforce/HubSpot
  - Enable non-technical users to customize

### Secondary: Open-Source Enthusiasts / DevOps Teams
- **Pain Points**:
  - Need CRM for internal use but want full control
  - Want to contribute/extend for specific use cases
  - Require on-premise deployment for compliance
- **Jobs to Be Done**:
  - Deploy via Docker Compose / Kubernetes
  - Extend with custom plugins/integrations
  - Audit and trust the codebase
- **Success Metrics**:
  - Deploy in under 30 minutes
  - Comprehensive API documentation
  - Active community for support/contributions

### Tertiary: Agencies / Consultancies
- **Pain Points**:
  - Need multi-tenant CRM for managing client relationships
  - Require white-label / custom branding
  - Want to build vertical-specific features
- **Jobs to Be Done**:
  - Manage multiple workspaces with role-based permissions
  - Customize UI/branding per client
  - Build industry-specific workflows (real estate, recruiting, etc.)

## MVP Scope

### In Scope (Shipped Features)
1. **Data Model Customization**
   - Create custom objects (beyond standard People, Companies)
   - Add custom fields with rich types (text, number, date, relation, select, multi-select, etc.)
   - Define field metadata (required, unique, default values)
   - Manage object relationships (one-to-many, many-to-many)

2. **Views & Layouts**
   - Table view with inline editing
   - Kanban view (group by select/status fields)
   - Filters (and/or conditions on any field)
   - Sorting (multi-level)
   - Grouping (by any field)
   - Column visibility/reordering
   - Saved views per object

3. **Records & Activities**
   - Create, read, update, delete records
   - Attach notes, tasks, files to records
   - Activity timeline (audit log of changes)
   - Rich text notes (TipTap editor)
   - File attachments (S3-compatible storage)

4. **Collaboration**
   - Multi-user workspaces
   - Role-based permissions (Admin, Member, Viewer + custom roles)
   - Object-level and field-level permissions
   - User mentions in notes
   - Real-time updates (GraphQL subscriptions)

5. **Integrations**
   - Email sync (Gmail, Microsoft via OAuth)
   - Calendar sync (Google Calendar, Microsoft Calendar)
   - IMAP/SMTP for custom email providers
   - CalDAV for custom calendar providers
   - Zapier integration (3000+ apps)
   - REST/GraphQL API

6. **Workflows & Automation**
   - Visual workflow builder (trigger → actions)
   - Triggers: Record created/updated/deleted, field changed, time-based
   - Actions: Update field, send email, create record, HTTP request, AI assistant
   - Conditional logic (if/else branches)

7. **AI Features**
   - Built-in AI assistant (OpenAI, Anthropic, Google, xAI, Mistral)
   - Custom AI providers (OpenAI-compatible gateways)
   - AI-powered record enrichment
   - Code interpreter for data analysis

8. **Self-Hosting**
   - Docker Compose deployment
   - Kubernetes Helm charts
   - PostgreSQL + Redis + ClickHouse
   - S3-compatible file storage
   - Email configuration (SMTP)
   - SSO/SAML support

### Out of Scope (Planned / Future)
- **Mobile apps** (iOS, Android native) — web-only for now
- **Advanced analytics/BI** — basic charts shipped, not full BI tool
- **Marketing automation** (drip campaigns, A/B testing) — focused on CRM core
- **Telephony integration** (VoIP, call recording) — community plugins only
- **Advanced forecasting** (sales predictions, revenue modeling) — future enterprise feature
- **Multi-currency** — single currency per workspace for MVP
- **Time tracking** — not a project management tool

### Explicitly NOT Building
- **Full ERP** — CRM only, not inventory/manufacturing/accounting
- **GDPR auto-compliance** — tools provided, customer responsible for compliance
- **Guaranteed SLA** — community edition best-effort, paid plans have SLAs

## Success Metrics

### Adoption Metrics
- **Weekly Active Workspaces**: Workspaces with ≥1 user login in past 7 days
- **Time to First Value**: Minutes from signup to first record created
- **Workspace Retention**: % of workspaces active 30/60/90 days post-creation

### Engagement Metrics
- **Records Created per Workspace**: Average records/month
- **Custom Objects Created**: % of workspaces with ≥1 custom object
- **Workflows Enabled**: % of workspaces with ≥1 active workflow
- **API Usage**: API calls/day per workspace (indicates integration depth)

### Product-Market Fit
- **Net Promoter Score (NPS)**: Target >40
- **Feature Request Velocity**: GitHub issues with >10 upvotes per month
- **Self-Host Adoption**: Docker pulls, Helm chart installs per month
- **Community Growth**: Discord members, GitHub stars, contributors

### Technical Health
- **P95 Latency**: GraphQL queries <200ms, mutations <500ms
- **Uptime (SaaS)**: 99.9% monthly
- **Error Rate**: <0.1% of requests fail
- **Database Query Performance**: No queries >1s without pagination

### Business Metrics (SaaS)
- **Conversion Rate**: Trial → Paid workspace %
- **Monthly Recurring Revenue (MRR)**: Growth rate month-over-month
- **Customer Acquisition Cost (CAC)**: Cost per paid workspace
- **Lifetime Value (LTV)**: Average revenue per workspace over lifetime

## Strategic Constraints

### Architectural Decisions (Locked)
1. **Monorepo with Nx**: All packages in single repo, no polyrepo split
   - **Rationale**: Simplifies dependency management, atomic commits, shared tooling
   - **Trade-off**: Larger clone size, more complex CI

2. **PostgreSQL as primary database**: No MongoDB, no MySQL
   - **Rationale**: ACID compliance, JSONB for flexibility, robust ecosystem
   - **Trade-off**: Horizontal scaling requires partitioning/Citus

3. **GraphQL-first API**: REST as secondary, no gRPC
   - **Rationale**: Flexible queries, code generation, real-time subscriptions
   - **Trade-off**: More complex caching, N+1 query risk (mitigated with DataLoader)

4. **Schema-per-workspace multi-tenancy**: Not row-level isolation
   - **Rationale**: Performance isolation, easier backups/restores, simpler queries
   - **Trade-off**: Database connection pooling complexity, schema migration overhead

5. **TypeScript everywhere**: No Python, Go, Rust microservices
   - **Rationale**: Single language for frontend/backend, faster hiring, code sharing
   - **Trade-off**: Performance-critical tasks require careful optimization

6. **React for frontend**: No Vue, Angular, Svelte
   - **Rationale**: Largest ecosystem, hiring pool, component library availability
   - **Trade-off**: Bundle size, learning curve for hooks/state management

7. **Yarn 4 (berry) with PnP**: No npm, no pnpm
   - **Rationale**: Faster installs, strict dependency graphs, zero-installs capability
   - **Trade-off**: Compatibility issues with some packages (patched)

8. **AGPL-3.0 License**: Not MIT, not Apache 2.0
   - **Rationale**: Prevents cloud providers from offering proprietary versions
   - **Trade-off**: Some enterprises avoid AGPL, may limit commercial adoption

### Technical Debt Acceptance
- **Linaria styling**: Zero-runtime CSS-in-JS, but requires Vite plugin maintenance
- **TypeORM patches**: Custom patches for schema introspection, may break on updates
- **Upgrade commands vs TypeORM migrations**: Custom system adds learning curve but enables multi-tenant safety
- **Nx caching**: Aggressive caching speeds builds but can cause stale build issues

### Product Principles (Non-Negotiable)
1. **Self-hosting is first-class**: SaaS is a deployment option, not the product
2. **No feature gating behind paid tiers for self-hosted**: Open-source gets full features (except SaaS-specific like billing)
3. **API-first**: Every UI action must be doable via API
4. **Extensibility over feature bloat**: Plugin system preferred over built-in features
5. **Community-driven roadmap**: GitHub discussions/issues guide priorities

### Performance Budgets
- **Frontend bundle size**: <2MB gzipped for initial load
- **GraphQL query time**: P95 <200ms
- **Page load (Lighthouse)**: Performance score >85
- **Database migrations**: <30s for fast commands, <5min for slow (with `--include-slow`)

### Compliance & Security Boundaries
- **GDPR/CCPA**: Provide tools (data export, deletion) but customer responsible for compliance
- **SOC 2 (SaaS only)**: Planned, not yet certified
- **Encryption**: At-rest (database-level), in-transit (TLS), no end-to-end encryption for messages
- **Data residency**: Self-hosted controls region, SaaS currently US/EU only
