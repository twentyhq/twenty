# JAI OS — Documentation Index

JAI OS is an agentic CRM system built for Jai Digital Ads, a digital marketing agency in Chennai, India. It runs on Twenty CRM (self-hosted) with four AI agents — Manager, WhatsApp, Reporting, Assistant — built on DeepAgents/LangGraph, handling lead intake, client messaging, reporting, and internal staff support.

**This file is the entry point only. Do not read every file in this folder.** Read the specific file below that matches the current question or task, using its "read when" condition to decide.

## Files in this folder

- **01-tech-stack.md** — Read when choosing a library, setting up infrastructure, or asking "what do we use for X." Full stack: Twenty CRM, DeepAgents/LangGraph, Fireworks AI (primary LLM) + OpenAI (fallback), Arize Phoenix, LLM Guard, WhatsApp Business Cloud API, Google Calendar API, Telegram Bot API, Hostinger VPS + Docker Compose.

- **02-architecture.md** — Read when implementing the Controlled Tool API, wiring an agent to Twenty, or understanding how data flows between components. Covers the boundary layer between agents and the CRM, RBAC-based routing, and the overall system diagram.

- **03-agents/manager-agent.md** — Read when building or modifying the Manager agent. Triggers, task-assignment logic, Telegram/widget approval interface, which WhatsApp messages it reviews.

- **03-agents/whatsapp-agent.md** — Read when building or modifying WhatsApp behavior. Autonomy boundaries, lead vs. client detection, Tamil/Tanglish handling, calendar booking flow, Meta CTWA ad tagging, escalation rules.

- **03-agents/reporting-agent.md** — Read when building or modifying the Reporting agent. Scope, query behavior, output channels.

- **03-agents/assistant-agent.md** — Read when building or modifying the Assistant agent. Scope (Twenty CRM navigation only), permissions (read-only, staff + admin).

- **04-data-model.md** — Read when creating or modifying a Twenty CRM object or field. Custom objects (Invoice with GST fields, lead source/campaign tracking), which standard objects are in use, role definitions.

- **05-features.md** — Read when implementing a specific cross-cutting feature: calendar booking, CTWA lead capture, task assignment, notifications, the human-approved learning loop.

- **06-integrations.md** — Read when setting up or debugging an external service connection: WhatsApp Business API, Google Calendar API, Meta CTWA, Telegram bot — what each is for and how it connects in.

- **07-security-and-permissions.md** — Read when implementing anything touching access control or approval gates: RBAC roles, agent-to-agent permission boundaries, Telegram bot lockdown, escalation rules.

- **08-build-phases.md** — Read when planning what to build next or sequencing work. The 7-phase build order and the reasoning behind the sequence.

## Non-negotiable constraints (apply everywhere, always relevant)

- Every agent action goes through the Controlled Tool API. No agent touches Twenty's database directly.
- Money or contract topics always escalate to a human. No exceptions, in any agent.
- Self-learning is human-approved only. An agent may propose a behavior change; it never applies one automatically.
- Everything in this build is free/open-source, except three paid items: LLM API usage, WhatsApp Business API, VPS hosting.