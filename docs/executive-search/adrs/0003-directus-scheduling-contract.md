# ADR-0003: Directus Scheduling Contract (PROPOSED)

**Status:** PROPOSED — decision gate immediately before PR23.
**Date:** 2026-07-15.

## Context

Directus has multiple scheduling-related collections: `interview_scheduling_polls`, `interview_time_slots`, `executive_availability_responses`, `company_availability_slots`, `scheduling_polls` (generic), `scheduling_poll_options`, `scheduling_poll_participants`, `scheduling_poll_responses`, and `calendly_events` (legacy import).

Twenty needs to initiate interview scheduling, consume candidate availability, and reconcile confirmed interviews. Two competing scheduling models must not run simultaneously.

## Required evidence before decision

- **Live Directus API access** to inspect the actual scheduling collection schemas (currently `UNKNOWN_PENDING_SCHEMA_SNAPSHOT`).
- Which scheduling collections are actively used vs legacy.
- Directus webhook/event capability for scheduling state changes.
- Rate limits for polling vs webhook-driven updates.

## Decision required

Choose one active scheduling contract:

### Option A — Interview-specific collections

Use `interview_scheduling_polls`, `interview_time_slots`, and `executive_availability_responses` as the active path. Generic `scheduling_poll*` collections remain legacy/backfill only.

**Pros:** purpose-built for interviews; cleaner semantics.
**Cons:** may not cover all scheduling needs; depends on Directus schema for these collections.

### Option B — Generic scheduling collections

Use the generic `scheduling_poll*` family as the active path for all scheduling.

**Pros:** flexible; single model.
**Cons:** interview-specific semantics may be lost; competing with existing interview-specific usage.

### Option C — Twenty-initiated with Directus display only

Twenty owns scheduling orchestration; Directus only displays confirmed interviews to candidates.

**Pros:** simplest integration; no competing poll models.
**Cons:** candidate cannot self-schedule through Directus; availability must be collected differently.

## Constraint

Regardless of option, avoid maintaining two competing active poll models. Choose one active contract and reference/backfill the others.
