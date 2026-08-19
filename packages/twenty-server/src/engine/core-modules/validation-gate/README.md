# Validation Gate

Custom addition to this Twenty fork. Not part of upstream Twenty.

## What it does

Blocks a record write BEFORE it reaches the database if configured requirements
aren't met, using Twenty's `WorkspaceQueryHook` `PRE_HOOK` mechanism
(`engine/api/graphql/workspace-query-runner/workspace-query-hook/`).

Twenty's built-in Workflow automation only reacts to database events
(`created | updated | deleted | destroyed | restored | upserted`) — all
post-write. There is no pre-write phase in Workflows, so a hard block on save
is not achievable from the UI. This module is a code-level extension that
fills that specific gap.

## How it works

```
PRE_HOOK  (*.updateOne)
   |
   |-- isSystemAuthContext -> allow immediately
   |     (workflow/cron/internal writes are exempt, so this can't block
   |      the app's own automations)
   |
   |-- match rules for this object (validation-gate.constants.ts)
   |-- evaluate each rule's requirements against the STORED record
   |     merged with the INCOMING payload (not the stored record alone --
   |     a single save that both fixes and completes a requirement must
   |     not be rejected)
   `-- throw with every unmet requirement listed, or return the payload
        unchanged
```

## Files

| File | Role |
|---|---|
| `validation-gate.constants.ts` | Rules, declared as data |
| `services/validation-gate.service.ts` | Scope check, rule matching, requirement evaluation |
| `query-hooks/validation-gate.update-one.pre-query-hook.ts` | Hook registration (`*.updateOne`) |
| `validation-gate.module.ts` | NestJS wiring |

Registered in `core-engine.module.ts` (the only existing file touched — a
2-line diff, so re-applying this module to a newer Twenty version stays cheap).

## Adding a rule

No code change. Add an entry to the `VALIDATION_RULES` array in
`validation-gate.constants.ts`:

```ts
{
  objectNameSingular: 'opportunity',
  whenField: 'stage',
  whenChangesTo: 'SOME_VALUE',
  requirements: [
    { type: 'relationNotEmpty', targetObjectNameSingular: '...',
      foreignKeyColumn: '...', min: 1, message: '...' },
    { type: 'filesFieldNotEmpty', field: '...', message: '...' },
  ],
}
```

Object/field names here refer to workspace metadata (custom objects/fields
configured through the CRM's own UI), so they must match exactly and are
expected to drift as the schema evolves — there is currently no startup
validation that a rule's referenced object/field/value still exists.

## Adding a new kind of requirement

Add a case to the `checkRequirement` switch in `validation-gate.service.ts`.
Two exist today: `relationNotEmpty` (count of child records via FK) and
`filesFieldNotEmpty` (non-empty FILES-type field on the record itself).

## Known limitations

- Enforces the transition, not a standing invariant. If a requirement is
  satisfied via a relation on a *child* record, later deleting/unlinking
  that child does not re-trigger this gate (that write targets the child
  object, not this one).
- Only registered on `*.updateOne`. `updateMany`, `createOne`, `createMany`
  are not currently covered — extend the same pattern if needed, but note a
  new record cannot satisfy a relation-based requirement at creation time
  (its children can't exist yet).
- Rules are a TypeScript constant, not a database table. This was
  deliberate to prove the mechanism first; moving to a DB-backed table +
  admin UI changes where rules are loaded from, not this logic.
