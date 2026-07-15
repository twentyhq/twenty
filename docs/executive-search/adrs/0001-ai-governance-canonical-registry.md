# ADR-0001: AI Governance Canonical Registry (PROPOSED)

**Status:** PROPOSED — decision gate immediately before PR30.
**Date:** 2026-07-15.

## Context

Both Directus and Twenty have AI governance infrastructure. Directus owns: `ai_model_registry`, `prompt_templates`, `assessment_runs`, `assessment_evidence`, `assessment_guardrail_checks`, `ai_request_log`, `audit_runs`, `audit_metrics`, `audit_findings`, and `user_contest_ai_score`. Twenty owns: agent entities, model config, execution records (turns/messages/parts), monitoring/evaluation, chat, and role-scoped agent tools.

Without a canonical decision, both systems could independently label a prompt or model "current," creating contradictory governance states.

## Decision required

Exactly one of:

### Option A — Directus-canonical

Directus governance collections remain canonical. Twenty writes through a governed Directus API.

**Pros:** preserves existing candidate-facing governance (consent, contest); no Directus migration risk.
**Cons:** Twenty AI capabilities depend on Directus availability; latency; tight coupling.
**Security:** Directus access controls remain authoritative.
**Migration cost:** low — Twenty adapts to read/write Directus registry.

### Option B — Shared-service-canonical

A standalone AI governance service becomes canonical; both systems reference it.

**Pros:** clean separation; neither system is a dependency of the other; future-proof.
**Cons:** new infrastructure to build and operate; both systems need adapter work.
**Security:** dedicated governance service with its own access model.
**Migration cost:** high — new service, dual adapters.

### Option C — Twenty-canonical-after-migration

Twenty becomes canonical after explicit migration, with backward-compatible Directus projections.

**Pros:** aligns with Twenty becoming the internal OS; single internal governance surface.
**Cons:** requires migrating Directus governance data; Directus portal must read projections.
**Security:** Twenty permission engine governs all AI access.
**Migration cost:** medium-high — migration with backward compatibility.

## Required evidence before decision

- Current Directus AI governance data volume and usage patterns.
- Candidate consent/contest flow dependency on Directus collections.
- Twenty agent execution volume and model diversity.
- Latency requirements for AI governance lookups.

## Recommendation

Defer until PR30. Until then, both systems may reference each other's records by ID/hash but must not create contradictory "current" designations.
