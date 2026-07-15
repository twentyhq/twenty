# ADR-0002: Client Collaboration Access Model (PROPOSED)

**Status:** PROPOSED — decision gate immediately before PR21.
**Date:** 2026-07-15.

## Context

Client search committees need to review longlists, shortlists, candidate presentations, provide feedback, view status reports, and schedule interviews. The client cannot be treated as an ordinary internal workspace member with broad discovery access.

## Decision required

Exactly one of:

### Option A — Restricted Twenty external-user roles

Use Twenty's existing role/permission/RLS engine with restricted external roles and client-specific row-level predicates.

**Pros:** reuses existing infrastructure; single codebase; no new deployment.
**Cons:** risk of accidental broad access if RLS predicates are misconfigured; Twenty workspace model assumes internal members.
**Security:** depends on RLS predicate correctness; client enumeration risk if predicates leak.
**Migration cost:** low-medium — configure roles and predicates.

### Option B — Dedicated client collaboration application/API

A narrowly scoped application backed by dedicated APIs, separate from the internal workspace.

**Pros:** strong isolation by construction; purpose-built UX; limited attack surface.
**Cons:** new application to build and maintain; data duplication/sync between internal and client views.
**Security:** separate authentication, separate data store, no database browse possible.
**Migration cost:** medium-high — new app/API surface.

## Required evidence before decision

- Client committee member count and access patterns.
- Twenty RLS predicate testing results for client-scoped queries.
- Client UX requirements (comparison views, feedback, exports).

## Constraints (apply to either option)

- Client never browses the executive database.
- Client sees only deliberately shared records.
- Client sees only their assignment's data.
- All shares are versioned, audited, and revocable.
- Watermarked exports with download audit where supported.
