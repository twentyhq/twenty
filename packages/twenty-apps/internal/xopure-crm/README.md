# XO Pure CRM Twenty App

This app defines the XO Pure CRM operating model as code for Twenty:

- customer and ambassador classification fields on People
- Customer, Ambassador, Order, Commission objects
- Retail Prospect and Influencer Prospect prospecting databases
- Email Sequence and CRM Automation Trigger objects
- Enrichment Task object for agent/research work queues
- Views and navigation to keep live CRM data separate from prospecting data
- AI agent/skill definitions for contact enrichment and outreach research
- Route stubs for Supabase webhook intake and enrichment job creation
- Read-only Supabase source orchestration (`docs/readonly-supabase-source.md`) -- wiring the backfill reader behind the existing mapper/upsert path

Install this app into the XO Pure Twenty workspace after the base server is deployed and the first admin account is created.
