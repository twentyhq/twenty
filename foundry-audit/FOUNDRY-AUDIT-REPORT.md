# Foundry Migration Audit Report
## The Original Body AG

**Date:** 2026-02-20 (updated 2026-02-24)
**Instance:** https://tob.palantirfoundry.com
**Ontology RID:** `ri.ontology.main.ontology.0b84f9c7-7c40-4529-812c-884185702950`

> **Note:** This report was originally generated from MCP API data on 2026-02-20.
> It has been trimmed to remove sections superseded by more authoritative sources:
> - **Object types & schema** → see `ontology.json`, `data-dictionary.md`, `foundry_ddl_report.md` (341 types, 305 after filtering)
> - **Resource inventory** → see `foundry_resources.csv` (8,425 resources incl. 2,320 datasets, 663 folders, 514 ontology object types, 362 pipelines, 204 workshop modules, 23 AIP agents)
> - **Migration priority tiers** → will be rebuilt from audit log usage data once available
>
> What remains below is qualitative context not captured by those sources: what Foundry does for the business, integration architecture, pipeline flows, risk classifications, and known audit gaps.

---

## 1. Executive Summary

### What Foundry Does for TOB

1. **Single source of truth** for contacts (Funnelbox/GHL), support tickets (Fluent), contracts, and invoices.
2. **AI-powered sales automation** -- KI-Jana drafts WhatsApp and email messages for sales reps; OOracle answers internal questions; Sales Angel assists CRM users.
3. **Zoom analytics at scale** -- meeting participation segments, recording watchtimes, transcripts, chat messages, surveys, and CTA extraction.
4. **Voice AI orchestration** -- 11Labs and VAPI phone-call agents with transcript analysis, review workflows, and insight generation.
5. **Customer support intelligence** -- ticket clustering, AI response drafting, knowledge-base retrieval.
6. **Marketing analytics** -- ad headlines/hooks/subject lines, marketing-offer participation tracking, touchpoint analytics.
7. **Health-program delivery** -- Summit App user data, body-structure analysis images, coaching program content management.

### Key Migration Risks

- Heavy reliance on Foundry-specific AIP agents, Automate monitors, and Workshop apps with no external equivalent.
- Complex data pipeline architecture (source -> mirror -> parsed -> gold -> materialisation) with many pipelines.
- WhatsApp/WAHA functions tightly coupled to Foundry's OSDK for real-time messaging.
- Vector embeddings and semantic search (Zoom transcripts, touchpoints) rely on Foundry-native capabilities.
- AI agent prompts, evaluation suites, and AIP logic are not exportable via API.

---

## 2. AI/Agent Capabilities (High Migration Risk)

These are the hardest-to-replicate systems. Their prompts, tool bindings, evaluation suites, and Automate monitors are Foundry-proprietary and not exportable via API.

| Agent / AI System | What It Does |
|-------------------|--------------|
| **OOracle** | General-purpose Q&A agent for the entire organization; wraps email drafting, WhatsApp messaging, lead Q&A |
| **KI-Jana** | AI that auto-drafts WhatsApp and email responses for sales reps based on conversation context. Includes AIP agents, Automate monitors, and evaluation suites |
| **Sales Angel** | CRM-integrated AI assistant for sales team |
| **Insight Engine** | Generates structured insights from call transcripts (Close.io + 11Labs), creates email offers, manages scope runs |
| **Customer Support AI** | Drafts ticket responses, finds similar tickets, retrieves relevant support instructions |
| **11Labs Voice AI** | Generates insight reports from voice-agent conversations, tracks most-asked questions |

### Automation

- **WhatsApp automation**: Functions handle the full lifecycle -- send messages (with anti-spam), send files/images/voice, manage typing indicators, sync labels, draft messages via AI, and manage conversation labels.
- **Email drafting**: KI-Jana generates, reviews, and sends email offers; email-offer cohorts are created automatically.
- **Contract automation**: Bulk DocuSeal contract creation, PandaDoc integration, error recovery.
- **Automate monitors**: Object Sentinel monitors trigger automatic drafting and processing.

---

## 3. Data Sources & Integrations

### External Systems Connected

| System | Direction | Data Flow | Criticality |
|--------|-----------|-----------|-------------|
| **MariaDB** | Ingest | Central mirror of all webhook payloads (Close, WAHA, Zoom, Skool, Kickscale, Fluent) | **Critical** -- primary data ingestion hub |
| **Close.io** | Bi-directional | Leads, calls, transcripts IN; tasks, smart views, campaigns OUT | **Critical** -- primary sales CRM |
| **GoHighLevel / Funnelbox** | Bi-directional | Contacts, emails, WhatsApp chats, form submissions, video tracking IN; tags OUT | **Critical** -- marketing automation platform |
| **FluentSupport** | Bi-directional | Tickets, customer data IN; AI responses, ticket updates OUT | **Critical** -- customer support |
| **Zoom** | Ingest + API | Meetings, recordings, transcripts, chat, surveys, events IN; event creation OUT | **Critical** -- core content delivery |
| **WhatsApp/WAHA** | Bi-directional | Messages, images, audio, labels IN; drafted messages, files, voice, typing indicators OUT | **Critical** -- sales channel |
| **ElevenLabs** | Bi-directional | Phone calls, transcripts, agent data IN; call reviews, insight generation OUT via REST API | **Important** -- voice AI |
| **VAPI** | Ingest | Assistant configs, calls, transcripts, reviews IN | **Important** -- voice AI |
| **Skool** | Ingest | Communities, members, posts, comments | **Important** -- community engagement |
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

## 4. Data Pipeline Architecture

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

---

## 5. Migration Risk Assessment

### Data Classification: Source-of-Truth vs Derived

| Category | Examples | Notes |
|----------|---------|-------|
| **Source of Truth** (only exists in Foundry) | FunnelboxContactV2, Contract, Invoice, Order, KI-Jana drafts, Jana Static Data, Insight answers, Custom embeddings, Lead Profiles, IdMatch | Must be exported; no external backup |
| **Mirrored from External** (upstream source exists) | TicketFluent, LeadClose, ZoomMeeting, SkoolPost, WahaMessage, 11Labs calls, VAPI calls | Can be re-ingested from source; only enrichments need migration |
| **Derived/Computed** (regenerable) | Advertisement content, Zoom participation segments, Classified objects, Materialised views | Can be recomputed if logic is preserved |
| **Ephemeral/Operational** | Draft messages, Job queues, Generation queues, Label sync logs | No long-term value; do not migrate |

### Hard-to-Replicate Outside Foundry

1. **AIP Agents** -- OOracle, KI-Jana Message Drafter, Sales Angel. Their system prompts, tool bindings, and evaluation suites are Foundry-proprietary.
2. **Automate Monitors** -- Monitors that trigger AI drafting automatically based on object changes.
3. **OSDK Integration** -- Sales CRM and CRM React apps use Foundry's OSDK for real-time ontology access.
4. **Vector Embeddings** -- Zoom transcript embeddings, Close call transcript embeddings, touchpoint embeddings for semantic search.
5. **Workshop Apps** -- Interactive apps with write-back actions, forms, and AIP logic.
6. **Streaming Pipelines** -- WAHA real-time message processing.
7. **Solution Designs** -- Architecture documentation that is visual and not exportable as data.

### Domain Risk Classification

| Domain | Classification | Reason | Migration Complexity |
|--------|---------------|--------|---------------------|
| **Funnelbox Contacts** | **Critical** | Central customer identity -- links all domains | Medium -- export as database, but links are complex |
| **Contracts & Invoices** | **Critical** | Financial source of truth | Low -- structured data, exportable |
| **Tickets (Fluent)** | **Critical** | Customer support history | Low -- FluentSupport is the upstream source |
| **Zoom Analytics** | **Critical** | Core business metric, large volume | High -- many derived objects, embeddings |
| **Sales/CRM (Close)** | **Critical** | Sales pipeline and lead intelligence | Medium -- Close.io is upstream, but enrichments are in Foundry |
| **WAHA/WhatsApp** | **Critical** | Active sales channel with real-time messaging | **Very High** -- streaming pipelines, tight OSDK coupling |
| **KI-Jana AI System** | **Important** | AI drafting for sales (emails + WhatsApp) | **Very High** -- agent prompts, evaluation suites, Automate monitors |
| **OOracle / AI Agents** | **Important** | Internal Q&A and automation | High -- AIP agent configs not exportable |
| **11Labs Voice AI** | **Important** | Voice agent analytics and insights | High -- evaluation criteria, insight pipeline |
| **Insights Engine (UC005)** | **Important** | Call insight generation | High -- deeply integrated, complex pipeline |
| **Marketing (Touchpoints)** | **Important** | Offer participation, touchpoint tracking | Medium -- can rebuild on simpler analytics |
| **Summit App** | **Important** | Health program user engagement | Medium -- app data is in WordPress/custom app |
| **Strukturanalyse** | **Important** | Body scan image processing and AI review | High -- media sets, image processing, AI review workflows |
| **Knowledge Base** | **Important** | Organizational knowledge with vector search | High -- embeddings, semantic search |
| **Finance (COAT, Bulk Contracts)** | **Important** | Contract automation workflows | Medium -- DocuSeal/PandaDoc are external |
| **VAPI** | **Low** | Small dataset, analytics only | Low |
| **Kickscale** | **Low** | Likely deprecated | Low -- can ignore |
| **Skool** | **Low** | Community data | Low -- Skool is upstream source |
| **Advertisement** | **Low** | Generated ad content, likely regenerable | Low -- bulk export |
| **Example/Demo** | **Deprecate** | Palantir learning data | N/A -- do not migrate |
| **Learning Projects** | **Deprecate** | Individual training sandboxes | N/A -- do not migrate |

---

## 6. What We Could NOT Audit

Known gaps where API access does not provide visibility. Items marked ~~strikethrough~~ have since been addressed.

### Addressed

| Item | How |
|------|-----|
| ~~Object type property schemas~~ | Exported via `ontology.json` (341 types). Full schema in `data-dictionary.md` |
| ~~Link type definitions~~ | Extracted from `ontology.json`. FK constraints in `foundry_fk.sql` (291), junction tables in `foundry_junction.sql` (15) |
| ~~Action type definitions~~ | Included in `ontology.json` export (407 action types) |
| ~~Resource inventory~~ | Matt's resource dataset (`foundry_resources.csv`, 8,425 resources) |

### Still Hidden

| Item | Why It Matters | Manual Step to Complete |
|------|---------------|----------------------|
| **AIP Agent system prompts** | OOracle, KI-Jana, Sales Angel prompts define AI behavior; cannot be recreated without them | Log into Foundry UI -> open each AIP Agent -> copy system prompt and tool configurations |
| **AIP Logic configurations** | TicketNextResponse Draft, KI-Jana Automate Drafter, KI-Jana Email Draft Reviewer | Open each AIP Logic -> document input/output mappings and LLM settings |
| **Workshop app page layouts** | Interactive apps with custom layouts, actions, and write-back logic | Open each Workshop app -> screenshot/document all pages and action types |
| **Automate monitor rules** | Monitors that trigger automated processing | Open Object Sentinel -> document trigger conditions and action configurations |
| **Pipeline code (Python transforms)** | Transformation logic in code repositories | Clone each code repository -> export all Python/TypeScript source |
| **Evaluation suite test cases** | Suites that evaluate AI quality | Open each eval suite -> export test inputs, expected outputs, and scoring criteria |
| **Dashboard/Quiver configurations** | Chart definitions, filters, data sources | Open each Quiver dashboard -> document chart types, filters, and data sources |
| **Restricted views & permissions** | At least 1 restricted view (Waha all messages restricted view) | Review Foundry permissions model -> document all restricted views and role mappings |
| **Connection credentials** | MariaDB, REST API keys, S3 credentials, WAHA API keys | Document all source connection details from Foundry Source configs |
| **Schedules & build triggers** | Pipeline build schedules, data sync frequencies | Check each pipeline's schedule configuration |
| **Media set contents** | Images, PDFs, videos, audio files | Inventory media file counts and total sizes |
| **Fusion sheet data** | Spreadsheets used as configuration/reference | Export each Fusion Sheet to CSV |
| **Solution design diagrams** | Architecture diagrams | Screenshot or export each Solution Design |
| **Carbon workspace layouts** | Homepage/workspace widget configurations | Screenshot layouts and widget configurations |

---

*This report was originally generated from MCP API data on 2026-02-20. Updated 2026-02-24 to remove sections superseded by `ontology.json`, `foundry_resources.csv`, `data-dictionary.md`, and `foundry_ddl_report.md`. Migration priority tiers (formerly Section 8) will be rebuilt from audit log usage data.*
