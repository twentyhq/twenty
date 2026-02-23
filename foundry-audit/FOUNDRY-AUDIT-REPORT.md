# Foundry Migration Audit Report
## The Original Body AG

**Date:** 2026-02-20
**Instance:** https://tob.palantirfoundry.com
**Ontology RID:** `ri.ontology.main.ontology.0b84f9c7-7c40-4529-812c-884185702950`

---

## 1. Executive Summary

The Original Body AG (TOB) uses Palantir Foundry as a centralized data platform that spans nearly every operational domain: CRM and sales, customer support, marketing, finance, AI-powered automation, community management, voice AI agents, and health-program delivery (body structure analysis, coaching sessions, summit events).

### Scale

| Dimension | Count |
|-----------|-------|
| Object types (ontology) | 251 |
| Custom functions | 255 |
| LLM/platform model endpoints | ~410 |
| Data objects (rows with counts) | ~1.38 million |
| Top-level folders/projects | ~62 |
| Code repositories | 25+ |
| Data pipelines | 40+ |
| Workshop applications | 15+ |
| External data sources | 10+ |
| AIP agents | 3+ |

### What Foundry Does for TOB

1. **Single source of truth** for contacts (Funnelbox/GHL, 142K), support tickets (Fluent, 14K), contracts (13K), and invoices (7K).
2. **AI-powered sales automation** -- KI-Jana drafts WhatsApp and email messages for sales reps; OOracle answers internal questions; Sales Angel assists CRM users.
3. **Zoom analytics at scale** -- 584K meeting-participation segments, 214K recording watchtimes, transcripts, chat messages, surveys, and CTA extraction.
4. **Voice AI orchestration** -- 11Labs and VAPI phone-call agents with transcript analysis, review workflows, and insight generation.
5. **Customer support intelligence** -- ticket clustering, AI response drafting, knowledge-base retrieval.
6. **Marketing analytics** -- 84K ad headlines/hooks/subject lines, marketing-offer participation tracking, touchpoint analytics.
7. **Health-program delivery** -- Summit App user data, body-structure analysis images, coaching program content management.

### Key Migration Risks

- Heavy reliance on Foundry-specific AIP agents, Automate monitors, and Workshop apps with no external equivalent.
- Complex data pipeline architecture (source -> mirror -> parsed -> gold -> materialisation) with 40+ pipelines.
- 37+ WhatsApp/WAHA functions tightly coupled to Foundry's OSDK for real-time messaging.
- Vector embeddings and semantic search (Zoom transcripts, touchpoints) rely on Foundry-native capabilities.
- AI agent prompts, evaluation suites, and AIP logic are not exportable via API.

---

## 2. Data Model Overview

### Domain Summary

| Domain | Object Types | Largest Type (Rows) | Total Est. Rows | Description |
|--------|-------------|---------------------|-----------------|-------------|
| **Zoom/Sessions** | 36 | MeetingParticipationSegment (584K) | ~903K | Meeting analytics, transcripts, recordings, chat, surveys, CTAs |
| **Sales/CRM (Close, Leads)** | 25 | LeadClose (unknown) | Medium | Close.io leads, transcripts, insights, campaigns, profiles |
| **Other/Misc** | 24 | DraftWhatsappAnswer (865) | Low | Coaching sessions, app events, YouTube, dev tests |
| **WAHA (WhatsApp)** | 16 | WahaConversation (1,917) | ~3K | WhatsApp conversations, messages, labels, images, transcriptions |
| **Customer Support (Fluent)** | 14 | TicketFluent (13,727) | ~14K | Tickets, clusters, issues, agents, support instructions |
| **11Labs (ElevenLabs)** | 14 | EvaluationCriteria (4,050) | ~4K | Voice agents, phone calls, transcripts, reviews, insights |
| **Funnelbox/GHL** | 13 | FunnelboxContactV2 (141,620) | ~142K | Central contacts, emails, WhatsApp, videos, surveys |
| **Summit App** | 12 | SummitAppStrukturanalyse (7,714) | ~11K | User profiles, video watching, surveys, body analysis |
| **Insights Engine** | 12 | CallInsightAnswerAggregated (76) | Low | Unified call insights across Close.io and 11Labs |
| **Example/Demo** | 12 | ExampleFlight (demo) | N/A | Palantir-provided airline demo data (ignore) |
| **Marketing** | 11 | EmailOfferCohort (9,665) | ~10K | Offers, campaigns, touchpoints, form submissions |
| **Finance** | 11 | Contract (12,992) | ~25K | Contracts, invoices, orders, bulk creation |
| **Internal/Admin** | 8 | FoundryResource (unknown) | Low | Platform governance, cost tracking, identity matching |
| **Strukturanalyse** | 8 | ReviewResponseProcessed (153) | Low | Body scan images, AI reviews |
| **Product/Coaching** | 6 | ProductLecture (unknown) | Low | Program modules, lectures, session types |
| **Log Types** | 6 | (auto-generated) | Low | Action audit logs |
| **VAPI** | 5 | VapiAssistantsLatest (31) | Low | Voice assistants, calls, reviews |
| **Skool** | 4 | SkoolPostComment (7,961) | ~8K | Community posts and comments |
| **Knowledge Base** | 4 | KbDocument (unknown) | Low | Document chunks, Q&A, vector embeddings |
| **Kickscale** | 4 | (unknown) | Low | Call analysis (likely deprecated) |
| **KI-Jana** | 3 | KiJanaEmailOfferDraft (7,406) | ~7.5K | AI-drafted emails and messages |
| **Advertisement** | 3 | AdvertisementLandingPageHeadline (84K) | ~252K | Generated ad content |

### Most Critical Object Types (by data volume and business importance)

| Object Type | Rows | Why It Matters |
|-------------|------|----------------|
| MeetingParticipationSegmentZoom | 584,056 | Core engagement analytics for summit programs |
| ZoomRecordingSessionWatchtime | 213,963 | Measures customer engagement with content |
| FunnelboxContactV2 | 141,620 | **Central customer entity** -- links to sales, support, marketing |
| Advertisement (3 types) | ~252K | Ad-copy library for marketing campaigns |
| TicketFluent | 13,727 | Customer support ticket history |
| Contract | 12,992 | Financial source of truth |
| Invoice | 7,028 | Billing records |
| KiJanaEmailOfferDraft | 7,406 | AI sales-email drafts (operational) |
| SkoolPostComment | 7,961 | Community engagement data |

---

## 3. Functional Capabilities

### Function Categories

| Category | Count | Purpose |
|----------|-------|---------|
| UC005 - Insight Pipeline | 37 | End-to-end insight generation, scope runs, CTA search, email offer creation |
| WhatsApp/WAHA (all) | 37 | Message sending, drafting, media, typing indicators, label sync |
| Insights & Analytics | 22 | Call insight generation, aggregation, classification, touchpoint analysis |
| Programs & Sessions | 23 | Program/module/lecture queries, attendance tracking (all have JSON variants) |
| Customer Support | 23 | Ticket lookup, AI response drafting, similar-ticket search, cluster generation |
| Sales/CRM - Lead Mgmt | 16 | Lead lookup by phone/email, profile management, tagging, snoozing |
| OOracle / AI Agents | 10 | General Q&A agent, email/WhatsApp drafters, Sales Angel |
| Sales/CRM - Close.io | 9 | Lead data, insight generation, campaign/task creation |
| KI-Jana Drafting | 8 | Email/message drafting, review, auto-send, reject |
| Contracts / DocuSeal | 12 | Bulk contract creation, PandaDoc integration, error handling |
| 11Labs / Voice AI | 5 | Insight reports, most-asked questions, conversation lookup |
| Zoom Events | 5 | Create/update/delete Zoom events and sessions |
| Contacts / Watch Time | 5 | Filter contacts by event watchtime (multiple optimization variants) |
| Utility / Data Processing | 12 | RID conversion, URL handling, format helpers |
| Draft & Task Management | 7 | Bulk draft status changes, task CRUD |

### AI/Agent Capabilities (High Migration Risk)

| Agent / AI System | Functions | What It Does |
|-------------------|-----------|--------------|
| **OOracle** | oOracle, oOraclev2 + 5 wrappers | General-purpose Q&A agent for the entire organization; wraps email drafting, WhatsApp messaging, lead Q&A |
| **KI-Jana** | 8 functions + 3 AIP agents + 2 monitors | AI that auto-drafts WhatsApp and email responses for sales reps based on conversation context |
| **Sales Angel** | aipSalesAssistant | CRM-integrated AI assistant for sales team |
| **Insight Engine** | 37+ UC005 functions | Generates structured insights from call transcripts (Close.io + 11Labs), creates email offers, manages scope runs |
| **Customer Support AI** | issueResponderViaTicketThread, issueResponseDrafter + 5 more | Drafts ticket responses, finds similar tickets, retrieves relevant support instructions |
| **11Labs Voice AI** | 5 functions | Generates insight reports from voice-agent conversations, tracks most-asked questions |

### Automation Functions (WAHA, Email, Contracts)

- **WhatsApp automation**: 37 functions handle the full lifecycle -- send messages (with anti-spam), send files/images/voice, manage typing indicators, sync labels, draft messages via AI, and manage conversation labels.
- **Email drafting**: KI-Jana generates, reviews, and sends email offers; email-offer cohorts are created automatically.
- **Contract automation**: Bulk DocuSeal contract creation, PandaDoc integration, Black Friday special flows, error recovery.
- **Automate monitors**: At least 4 Object Sentinel monitors trigger automatic drafting and processing.

---

## 4. Data Sources & Integrations

### External Systems Connected

| System | Direction | Data Flow | Criticality |
|--------|-----------|-----------|-------------|
| **MariaDB** | Ingest | Central mirror of all webhook payloads (Close, WAHA, Zoom, Skool, Kickscale, Fluent) | **Critical** -- primary data ingestion hub |
| **Close.io** | Bi-directional | Leads, calls, transcripts IN; tasks, smart views, campaigns OUT | **Critical** -- primary sales CRM |
| **GoHighLevel / Funnelbox** | Bi-directional | 142K contacts, emails, WhatsApp chats, form submissions, video tracking IN; tags OUT | **Critical** -- marketing automation platform |
| **FluentSupport** | Bi-directional | 14K tickets, customer data IN; AI responses, ticket updates OUT | **Critical** -- customer support |
| **Zoom** | Ingest + API | Meetings, recordings, transcripts, chat, surveys, events IN; event creation OUT | **Critical** -- core content delivery |
| **WhatsApp/WAHA** | Bi-directional | Messages, images, audio, labels IN; drafted messages, files, voice, typing indicators OUT | **Critical** -- sales channel |
| **ElevenLabs** | Bi-directional | Phone calls, transcripts, agent data IN; call reviews, insight generation OUT via REST API | **Important** -- voice AI |
| **VAPI** | Ingest | Assistant configs, calls, transcripts, reviews IN | **Important** -- voice AI |
| **Skool** | Ingest | Communities, members, posts, comments (8K comments) | **Important** -- community engagement |
| **PandaDocs / DocuSeal** | Bi-directional | Contract templates IN; bulk contract creation OUT | **Important** -- contract management |
| **Google Sheets** | Ingest | COAT Automation source for finance | **Nice-to-have** |
| **WordPress** | Ingest | App database sync | **Nice-to-have** |
| **Kickscale** | Ingest | Leads, calls, speakers, insights (likely deprecated) | **Low** |
| **YouTube** | Ingest | Analytics, transcripts, metadata | **Nice-to-have** |
| **Vimeo** | Ingest | Video hosting data | **Nice-to-have** |
| **S3** | Storage | AWS S3 connection for media | **Important** -- media storage |
| **Slack** | Outbound | Via n8n, not Foundry (customer support notifications) | **N/A** -- already external |
| **Google Ads** | Planned | Empty folder -- not yet connected | **N/A** |
| **Hyros** | Unknown | Folder exists, no visible datasets | **Unknown** |
| **Bexio** | Unknown | Folder exists, no visible datasets | **Unknown** |

### Integration Architecture

```
External Systems
    |
    |-- REST APIs (Close, WAHA, 11Labs, VAPI, FluentSupport, Funnelbox)
    |-- MariaDB (webhook payload storage for Close, WAHA, Zoom, Skool, etc.)
    |-- Direct connectors (WordPress JDBC, S3, Google Sheets)
    |
    v
Foundry Ingest Layer (source_MariaDB/00_mariadb_mirror)
    |
    v
Processing Layer (parsed/derived datasets)
    |
    v
Gold Layer (ontology backing datasources)
    |
    v
Materialisation Layer (aggregated views)
    |
    v
Applications & AI Agents
```

---

## 5. Applications & Dashboards

### Workshop Applications (15+)

| Application | Project | Purpose |
|-------------|---------|---------|
| **Summit Cockpit** | Applications | Central summit event management |
| **Meetings for Knowledge Base** | Applications | Meeting content management |
| **Meetings Summit Summit** | Applications | Summit meeting viewer |
| **Eleven Labs Monitoring** | Eleven Labs (prod) | Voice AI KPIs and monitoring |
| **Eleven Labs KPI Dashboard** | Eleven Labs (dev) | Voice AI analytics |
| **[TEST] Eleven Labs Testing Grounds** | Eleven Labs (dev) | Voice AI testing |
| **Ticket Cluster Analysis 2.0** | source_MariaDB/Fluent | Support ticket clustering |
| **Ticket Cluster Analysis Manual** | source_MariaDB/Fluent | Manual ticket clustering |
| **WhatsApp Chats v0.1** | source_MariaDB | WhatsApp conversation viewer |
| **KiJana Call Monitoring** | uc_005 | KI-Jana call tracking |
| **Jana Email v1.0** | uc_005 | Email drafting interface |
| **KI-Jana Email Offer Review** | uc_005 | Email offer review/approval |
| **Summit App - Original Moments** | uc_005 | Summit highlights |
| **Zoom App** | uc_005 | Zoom analytics viewer |
| **Summit strukturanalyse** | uc_005/pipeline | Body structure analysis |
| **Workshop module** | Lascha | General workshop module |

### Quiver Dashboards (5+)

| Dashboard | Location | Purpose |
|-----------|----------|---------|
| **Zoom Metric Analytics** | Applications/a quiver | Zoom engagement metrics |
| **WhatsApp dashboards (3x)** | source_MariaDB/GoHighLevel | WhatsApp conversation analytics |
| **Summit Dashboard** | source_MariaDB/_To Be Deleted | Marked for deletion |

### Carbon Workspaces

| Workspace | Location | Purpose |
|-----------|----------|---------|
| **Finance** | Homepages | Finance homepage |
| **Summit 08** | uc_005/applications | Summit event workspace |

### AIP Agents

| Agent | Location | Purpose |
|-------|----------|---------|
| **Schmerzfrei.Summit - Agent v1** | source_MariaDB/GoHighLevel | Health program AI agent |
| **KI-Jana Message Drafter** | uc_005/logic/KI-Jana | WhatsApp message drafting AI |
| **OOracle** (via functions) | Applications | General Q&A agent |

### What We CANNOT See

- Dashboard layouts and widget configurations
- Workshop app page definitions and action configurations
- AIP agent system prompts and tool configurations
- Evaluation suite test cases and results
- Custom widget set code
- Carbon workspace layouts
- Form field definitions

---

## 6. Data Pipeline Architecture

### Pipeline Flow (A -> B -> C -> D)

```
A: Raw Mirror                    B: Parsed/Derived              C: Gold/Ontology           D: Materialisation
(source_MariaDB/00_mariadb_mirror)  (per-service folders)         (ontology/data/C-gold)      (ontology/data/D)

payload__close_*     ------>  close.contact              ---->  [ontology backing]   ---->  aggregated views
payload__waha_*      ------>  waha_message_parsed        ---->  datasets                   lead profiles
payload__fluent_*    ------>  ticket cluster datasets     ---->                              touchpoint summaries
zoom_recording       ------>  zoom.transcripts           ---->                              insight aggregations
kickscale_call       ------>  parsed call data            ---->
```

### Key Pipelines by Domain

| Domain | Pipelines | Purpose |
|--------|-----------|---------|
| **Zoom** | Summit Pipeline Zoom, Zoom Transcripts, Zoom Event Participation, Zoom Classified LLM Transformations, Zoom Raw Lightweight, Zoom Objects 2.0, Zoom Chat Participation | Raw Zoom data -> parsed -> ontology objects |
| **WAHA** | WAHA MessagesAny/Deleted/Edited stream processing, WAHA Status stream, Voice Message Transcription, WAHA Materialisation IDF, WAHA Conversation Analysis | Real-time WhatsApp message processing |
| **Close.io** | Close Pipeline Raw, [Close] Call | CRM data sync |
| **Fluent** | PandaDoc to Customer, FluentBase64User | Support ticket processing |
| **Marketing** | Marketing Offer Participation (Daily), Signed MOP, Profiles, Legacy Profiles Export | Marketing analytics |
| **Finance** | (via uc_finance code repository) | COAT automation, bulk contracts |
| **11Labs** | Eleven Labs Calls KPIs | Voice AI metrics |
| **Summit** | Summit Daily Recap Email, Summit Transcripts, Summit Attendance Prediction | Event analytics and ML |
| **Ontology** | Touchpoints Embeddings, Youtube Transcripts, [various] from_source_processed_to_ontology_gold | Cross-domain enrichment |

### Code Repositories (25+)

| Repository | Location | Purpose |
|------------|----------|---------|
| **Ontology TypeScript Functions** | ontology/functions | Core ontology functions |
| **Ontology TypeScript 2 Functions** | ontology/functions | Updated ontology functions |
| **UDF Functions** | ontology/functions | User-defined functions |
| **extract_transcript_blocks** | ontology/functions | Zoom transcript processing |
| **Data Products Swagger** | ontology | API documentation |
| **Eleven Labs** | Eleven Labs/logic | 11Labs data processing |
| **Eleven Labs - Tool Functions** | Eleven Labs/logic | 11Labs tool functions |
| **Eleven Labs UDFs** | Eleven Labs/logic | 11Labs user-defined functions |
| **Eleven Labs FoOs** | uc_005/logic | 11Labs function objects |
| **Ontology Functions Summit (v1, v2)** | source_MariaDB/Functions | Summit-specific functions |
| **Ontology Functions (tsv2)** | source_MariaDB/Zoom | Zoom functions |
| **Split Issue function** | source_MariaDB/Fluent | Ticket issue processing |
| **Sales CRM - TSv2 functions** | Waha | Sales CRM TypeScript |
| **Sales CRM - TypeScript Functions** | Waha | Sales CRM functions |
| **TOB CRM ts2 functions** | uc_008_crm | CRM application logic |
| **CRM React repository** | uc_008_crm | CRM frontend |
| **Sales CRM React Repository** | uc_009_sales_crm | Sales CRM frontend |
| **Data Governance code repo** | Data Governance | Cost tracking logic |
| **uc_finance code repository** | uc_finance | Finance automation |
| **WAHA REST API** | Waha | WhatsApp API integration |
| **Waha data modelling** | Waha | WAHA data transforms |
| **Waha batch Repository** | Waha/old | Legacy batch processing |
| **Zapier Webhook (Zoom Recordings)** | Lascha | Zoom recording ingestion |
| **[Zoom] Event Tickets** | ontology/pipelines | Zoom ticketing logic |
| **Youtube Metadata** | ontology/pipelines | YouTube data processing |

### ML / AI Training

| Asset | Location | Purpose |
|-------|----------|---------|
| **KI-Jana ML objective** | ontology/pipelines/lead_model_training | Lead scoring / Jana training |
| **Summit Attendance Prediction** | ontology/pipelines/lead_model_training | Predicting summit attendance |
| **KI-Jana PreDrafter - evaluation suite** | uc_005/logic/KI-Jana | AI draft quality evaluation |
| **KI-Jana Message Drafter - evaluation suite** | uc_005/logic/KI-Jana | Message drafter evaluation |
| **CreateSummitProfile - evaluation suite** | Applications | Profile creation evaluation |

---

## 7. Migration Risk Assessment

### Domain Risk Classification

| Domain | Classification | Reason | Migration Complexity |
|--------|---------------|--------|---------------------|
| **Funnelbox Contacts (142K)** | **Critical** | Central customer identity -- links all domains | Medium -- export as CSV/database, but links are complex |
| **Contracts & Invoices** | **Critical** | Financial source of truth (13K contracts, 7K invoices) | Low -- structured data, exportable |
| **Tickets (Fluent)** | **Critical** | Customer support history (14K tickets) | Low -- FluentSupport is the upstream source |
| **Zoom Analytics** | **Critical** | Core business metric (903K objects) | High -- massive volume, many derived objects, embeddings |
| **Sales/CRM (Close)** | **Critical** | Sales pipeline and lead intelligence | Medium -- Close.io is upstream source, but enrichments are in Foundry |
| **WAHA/WhatsApp** | **Critical** | Active sales channel with real-time messaging | **Very High** -- 37 functions, streaming pipelines, tight OSDK coupling |
| **KI-Jana AI System** | **Important** | AI drafting for sales (emails + WhatsApp) | **Very High** -- agent prompts, evaluation suites, Automate monitors |
| **OOracle / AI Agents** | **Important** | Internal Q&A and automation | High -- AIP agent configs not exportable |
| **11Labs Voice AI** | **Important** | Voice agent analytics and insights | High -- evaluation criteria, insight pipeline |
| **Insights Engine (UC005)** | **Important** | 37 functions for call insight generation | High -- deeply integrated, complex pipeline |
| **Marketing (Touchpoints)** | **Important** | Offer participation, touchpoint tracking | Medium -- can rebuild on simpler analytics |
| **Summit App** | **Important** | Health program user engagement | Medium -- app data is in WordPress/custom app |
| **Strukturanalyse** | **Important** | Body scan image processing and AI review | High -- media sets, image processing, AI review workflows |
| **Knowledge Base** | **Important** | Organizational knowledge with vector search | High -- embeddings, semantic search |
| **Finance (COAT, Bulk Contracts)** | **Important** | Contract automation workflows | Medium -- DocuSeal/PandaDoc are external |
| **VAPI** | **Low** | Small dataset (31 assistants), analytics only | Low |
| **Kickscale** | **Low** | Likely deprecated, 4 object types | Low -- can ignore |
| **Skool** | **Low** | Community data (8K comments) | Low -- Skool is upstream source |
| **Advertisement (252K)** | **Low** | Generated ad content, likely one-time or regenerable | Low -- bulk export |
| **Example/Demo** | **Deprecate** | Palantir learning data (airline flights) | N/A -- do not migrate |
| **Learning Projects (6)** | **Deprecate** | Individual training sandboxes | N/A -- do not migrate |
| **Log Types** | **Low** | Auto-generated audit logs | Low -- ephemeral |

### Data Classification: Source-of-Truth vs Derived

| Category | Object Types | Notes |
|----------|-------------|-------|
| **Source of Truth** (only exists in Foundry) | FunnelboxContactV2, Contract, Invoice, Order, KI-Jana drafts, Jana Static Data, Insight answers, Custom embeddings, Lead Profiles | Must be exported; no external backup |
| **Mirrored from External** (upstream source exists) | TicketFluent, LeadClose, ZoomMeeting, SkoolPost, WahaMessage, 11Labs calls, VAPI calls | Can be re-ingested from source; only enrichments need migration |
| **Derived/Computed** (regenerable) | Advertisement content (252K), Zoom participation segments, Classified objects, Materialised views | Can be recomputed if logic is preserved |
| **Ephemeral/Operational** | Draft messages, Job queues, Generation queues, Label sync logs | No long-term value; do not migrate |

### Hard-to-Replicate Outside Foundry

1. **AIP Agents** -- OOracle, KI-Jana Message Drafter, Sales Angel. Their system prompts, tool bindings, and evaluation suites are Foundry-proprietary.
2. **Automate Monitors** -- 4+ monitors that trigger AI drafting automatically based on object changes.
3. **OSDK Integration** -- Sales CRM and CRM React apps use Foundry's OSDK for real-time ontology access.
4. **Vector Embeddings** -- Zoom transcript embeddings, Close call transcript embeddings, touchpoint embeddings for semantic search.
5. **Workshop Apps** -- 15+ interactive apps with write-back actions, forms, and AIP logic.
6. **Streaming Pipelines** -- WAHA real-time message processing (5+ stream-processing pipelines).
7. **Solution Designs** -- Architecture documentation that is visual and not exportable as data.

---

## 8. Recommended Migration Priority

### Tier 1: Migrate First (Source-of-Truth Data, Critical Operations)

| What | Object Types | Est. Rows | Action |
|------|-------------|-----------|--------|
| Customer contacts | FunnelboxContactV2 | 141,620 | Export full dataset with all properties; establish new master identity |
| Contracts | Contract, ContractsToBeExported | 15,675 | Export to database; continue using PandaDocs/DocuSeal directly |
| Invoices & Orders | Invoice, InvoiceReminder, InvoiceComment, Order | 12,444 | Export to database or accounting system |
| Support tickets | TicketFluent (enrichments only) | 13,727 | Export Foundry enrichments; FluentSupport has originals |
| Lead profiles | leadProfilev2, LeadProfile, LeadMindsetStages | ~100 | Export AI-enriched lead data |
| ID Matcher | IdMatch | Unknown | **Critical** -- maps identities across all systems |
| KI-Jana drafts | JanaDraft, KiJanaEmailOfferDraft | 7,538 | Export if needed for audit trail |

### Tier 2: Migrate Soon (Active Integrations, Reporting)

| What | Object Types | Est. Rows | Action |
|------|-------------|-----------|--------|
| Zoom analytics | All 36 Zoom types | ~903K | Export aggregated metrics; re-ingest from Zoom API if needed |
| WhatsApp/WAHA | 16 WAHA types | ~3K | Rebuild messaging on n8n or dedicated platform; export conversation history |
| Close.io enrichments | 25 Close types | Medium | Export insight answers and profiles; re-ingest from Close.io |
| Marketing touchpoints | 11 Marketing types | ~10K | Export participation and touchpoint data |
| 11Labs analytics | 14 types | ~4K | Export call reviews and insights |
| Insights engine data | 12 Insight types | Low | Export aggregated insights |
| Knowledge base | 4 KB types | Low | Export documents and Q&A pairs |

### Tier 3: Evaluate (Can Possibly Be Replaced by Alternatives)

| What | Object Types | Est. Rows | Action |
|------|-------------|-----------|--------|
| AI agents (OOracle, Sales Angel) | N/A (functions) | N/A | Rebuild using Claude/GPT with external tools; re-author prompts |
| KI-Jana system | 3 KI-Jana types + functions | ~7.5K | Rebuild drafting logic in n8n or custom app |
| Summit App | 12 types | ~11K | Evaluate if WordPress app can handle independently |
| Strukturanalyse | 8 types | ~8K | Evaluate standalone image processing pipeline |
| COAT/Finance automation | via uc_finance | Low | Move to n8n or dedicated finance tool |
| Workshop apps (15+) | N/A | N/A | Evaluate which are actively used; rebuild critical ones |
| Bulk contract creation | 4 types | ~3K | Move to DocuSeal API directly |

### Tier 4: Deprecate (Unused, Demo Data, Outdated)

| What | Object Types | Notes |
|------|-------------|-------|
| Example/Demo (airline) | 12 types | Palantir learning data -- delete |
| Learning projects (6 folders) | N/A | Individual training sandboxes -- delete |
| Kickscale | 4 types | Likely abandoned |
| [DEPR] marked types | 8+ types (Fluent deprecated cluster/issue types) | Already deprecated |
| EXPERIMENTAL Zoom types | 3 types | Development artifacts |
| Near-empty types | MeetingForKnowledgeBase (1), CustomerSessionOpened (3), MarketingCampaign (2) | Possibly abandoned |
| Sandbox/Test projects | PlayGround, Matt Sandbox, Test Alex, etc. | Developer sandboxes |
| Google Ads source | 1 folder | Empty -- never connected |
| Empty UC projects | uc_004, uc_006 | Never implemented |

---

## 9. What We Could NOT Audit

The following are known gaps where the Foundry MCP API does not provide access or visibility.

### Completely Hidden

| Item | Why It Matters | Manual Step to Complete |
|------|---------------|----------------------|
| **AIP Agent system prompts** | OOracle, KI-Jana, Sales Angel prompts define AI behavior; cannot be recreated without them | Log into Foundry UI -> open each AIP Agent -> copy system prompt and tool configurations |
| **AIP Logic configurations** | TicketNextResponse Draft, KI-Jana Automate Drafter, KI-Jana Email Draft Reviewer | Open each AIP Logic -> document input/output mappings and LLM settings |
| **Workshop app page layouts** | 15+ apps with custom layouts, actions, and write-back logic | Open each Workshop app -> screenshot/document all pages and action types |
| **Automate monitor rules** | 4+ monitors trigger automated processing | Open Object Sentinel -> document trigger conditions and action configurations |
| **Pipeline code (Python transforms)** | 40+ pipelines contain transformation logic | Clone each code repository -> export all Python/TypeScript source |
| **Evaluation suite test cases** | 3+ suites evaluate AI quality | Open each eval suite -> export test inputs, expected outputs, and scoring criteria |
| **Dashboard/Quiver configurations** | 5+ dashboards with chart definitions | Open each Quiver dashboard -> document chart types, filters, and data sources |
| **Restricted views & permissions** | At least 1 restricted view (Waha all messages restricted view) | Review Foundry permissions model -> document all restricted views and role mappings |
| **Connection credentials** | MariaDB, REST API keys, S3 credentials, WAHA API keys | Document all source connection details from Foundry Source configs |
| **Schedules & build triggers** | Pipeline build schedules, data sync frequencies | Check each pipeline's schedule configuration |
| **Object type property schemas** | 251 object types with full property definitions | Use Foundry API or UI to export complete schemas (column names, types, constraints) |
| **Link type definitions** | Relationships between object types | Export from Ontology Manager -> document all link types and cardinalities |
| **Action type definitions** | Write-back actions configured on object types | Export from Ontology Manager -> document all action types and their logic |
| **Media set contents** | 8+ media sets (images, PDFs, videos, audio) | Inventory media file counts and total sizes |
| **Fusion sheet data** | 5+ spreadsheets used as configuration/reference | Export each Fusion Sheet to CSV |
| **Solution design diagrams** | 5+ architecture diagrams | Screenshot or export each Solution Design |
| **Flow workflow definitions** | 1 Flow workflow (wf-lineage-sales-crm) | Open and document the workflow steps |
| **Carbon workspace layouts** | 2 Carbon workspaces | Screenshot layouts and widget configurations |
| **~40 hidden object types** | API reports ~291 total but only 251 discoverable | May require higher permissions or different search patterns |
| **Foundry Resource cost data** | Cost tracking for platform governance | Export cost datasets for budget planning |

### Recommended Manual Audit Steps

1. **Export all code repositories** (25+) -- `git clone` each repository to preserve transformation logic.
2. **Document all AIP agents** -- Screenshot system prompts, tool configurations, and guardrail rules.
3. **Export object type schemas** -- Use Foundry Ontology Manager to export full property definitions for all 251 types.
4. **Inventory media sets** -- Count files and estimate storage for the 8+ media sets.
5. **Document pipeline schedules** -- Note which pipelines run on schedules vs on-demand.
6. **Export Fusion Sheets** -- Download all 5+ Fusion Sheets as CSV.
7. **Screenshot Workshop apps** -- Document all 15+ apps with page layouts and action configurations.
8. **Test data freshness** -- For each data source, verify when data was last synced.
9. **Identify active users** -- Check which Foundry users are active and which apps they use.
10. **Review Foundry billing** -- Understand current costs to compare with migration alternatives.

---

*This report was generated from MCP API data collected on 2026-02-20. It represents a point-in-time snapshot and should be supplemented with the manual audit steps described in Section 9.*
