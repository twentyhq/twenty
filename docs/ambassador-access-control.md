# Ambassador Access Control Plan

## Reader and post-read action

This document is for the internal XO Pure CRM implementer. After reading it, they should be able to build a role and record-visibility model where admins see everything, ambassadors see their own book of business, and ambassador managers see the ambassadors and leads assigned under them.

## Decision summary

Use a hierarchical ambassador access model instead of a simple owner-only model.

The CRM should support three operating roles:

1. **Admin**: full workspace and CRM access.
2. **Ambassador Manager**: access to their own records plus the records assigned to ambassadors they supervise.
3. **Ambassador Rep**: access only to records directly assigned to them.

The core implementation decision is to store direct Workspace Member ownership fields on each access-controlled record. Manager visibility should not depend on computing a hierarchy at query time. Instead, records should carry a denormalized supervisor field that can be used by row-level permissions.

## Goals

- Let admins manage all CRM data and settings.
- Let ambassador managers monitor their people, leads, prospects, customers, orders, commissions, tasks, and activity without exposing unrelated teams.
- Let ambassador reps work only their own assigned records.
- Keep permission rules understandable in the Twenty roles UI and GraphQL permission layer.
- Make the model auditable: every restricted record should clearly show who owns it and which manager can see it.

## Non-goals

- Building public ambassador portal functionality.
- Replacing the ecommerce/source-of-truth ambassador system.
- Supporting arbitrary multi-level commission genealogy in the first pass.
- Allowing users to self-assign broader visibility.

## Access model

### Admin

Admins can:

- Read, create, update, delete, and restore all CRM records.
- Manage roles, settings, fields, automations, imports, and integrations.
- Assign workspace members to roles.

### Ambassador Manager

Ambassador managers can:

- Read records directly assigned to them.
- Read records assigned to ambassadors they supervise.
- Monitor team activity, pipeline status, and follow-up work.
- Optionally update team records if the business wants managers to coach and correct data.

Ambassador managers should not:

- Access global CRM settings.
- Change role assignments.
- Export unrestricted data sets unless explicitly approved.
- See records belonging to other managers' teams.

### Ambassador Rep

Ambassador reps can:

- Read and update records directly assigned to them.
- Create new prospects/leads if those records are automatically assigned back to them.
- Manage their own tasks and follow-up data.

Ambassador reps should not:

- See other reps' records.
- See manager-only summary views outside their own performance.
- Delete records by default.
- Modify ownership/supervisor fields unless explicitly approved.

## Required data model

The existing XO Pure Ambassador object remains the business profile for ambassador lifecycle, level, referral code, attribution, and payout context.

Add explicit access-control relationships that point to Workspace Members:

### Ambassador profile fields

Each ambassador profile should include:

- **Workspace member**: the CRM user account for this ambassador, when the ambassador can log in.
- **Manager workspace member**: the CRM user who supervises this ambassador.
- **Status**: active, paused, rejected, etc.
- **Level**: seed, bronze, silver, gold, platinum, elite, etc.

### Access-controlled record fields

Every CRM object that should be restricted by ambassador visibility should include:

- **Assigned ambassador workspace member**: the rep who owns the record.
- **Supervisor workspace member**: the manager who can monitor the record.
- **XO Pure Ambassador**: optional business profile relation when attribution, commission, or referral-code reporting needs it.

The supervisor field is intentionally denormalized. When a record is assigned to an ambassador, automation should copy that ambassador's manager into the record's supervisor field.

## Permission rules

### Ambassador Rep role

For each restricted object:

- Can read records where assigned ambassador workspace member is the current workspace member.
- Can update records where assigned ambassador workspace member is the current workspace member, subject to field-level restrictions.
- Cannot delete by default.
- Cannot update ownership or supervisor fields by default.

### Ambassador Manager role

For each restricted object:

- Can read records where assigned ambassador workspace member is the current workspace member.
- Can read records where supervisor workspace member is the current workspace member.
- Can update team records only if the business approves manager edits.
- Cannot delete by default.
- Cannot update role assignments or global settings.

### Admin role

Admins keep unrestricted object and settings permissions.

## Objects to restrict in the first pass

Apply the model first to the operational objects ambassadors actually use:

- People
- Influencer prospects
- Retail prospects
- Customers
- Orders
- Commissions
- Tasks and follow-up records
- Notes or activities if they expose restricted customer/prospect context

Objects that only contain global catalogs, such as products or sequence templates, can remain broadly readable unless they contain sensitive business data.

## Automation invariants

The system should maintain these invariants:

1. If a record has an assigned ambassador workspace member, it should also have the correct supervisor workspace member.
2. If an ambassador's manager changes, existing active records should be backfilled to the new supervisor.
3. If a new record is created by an ambassador rep, ownership should default to that rep.
4. If a record is created by an admin/import/sync, ownership should be set from source attribution when available, otherwise left in an admin triage queue.
5. Users without admin access should not be able to broaden their own visibility by editing ownership fields.

## Views and operating experience

Recommended views:

- **My Leads / My Prospects** for ambassador reps.
- **My Team Leads / My Team Prospects** for managers.
- **Unassigned / Needs Triage** for admins.
- **Ambassador Roster** for managers, filtered to their supervised ambassadors.
- **Commission Review** for admins and optionally managers.

The UI should make ownership obvious. Users should be able to see who owns a record and which manager supervises it, even if they cannot edit those fields.

## Open business decisions

Before implementation, decide:

1. Can managers edit team records or only view them?
2. Can reps create new leads/prospects directly?
3. Can reps or managers export records?
4. Should reps see emails, notes, and timeline activity attached to their records?
5. How should unassigned records be routed?
6. Is there only one manager per ambassador for v1?
7. Should paused ambassadors retain CRM access?

## Implementation slices

1. Define the permission matrix and resolve open business decisions.
2. Add Workspace Member ownership and supervisor fields to restricted objects.
3. Add manager relationship fields to ambassador profiles.
4. Add automation to keep supervisor fields synchronized.
5. Create Ambassador Manager and Ambassador Rep roles with object, field, and row-level permissions.
6. Create operating views for admins, managers, and reps.
7. Add tests and smoke-test with one admin, one manager, and two reps.

## Verification plan

Use a fixture team:

- Admin A
- Manager M
- Rep R1 under Manager M
- Rep R2 under Manager M
- Rep R3 under a different manager

Verify:

- Admin A sees all records.
- Manager M sees R1 and R2 records, but not R3 records.
- Rep R1 sees only R1 records.
- Rep R1 cannot edit ownership/supervisor fields.
- Unassigned records appear only in admin triage.
- Imports and syncs correctly populate ownership and supervisor fields when source attribution exists.
