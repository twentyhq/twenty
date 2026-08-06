# Instructions for the Folk sync

Read this before writing to the `connection` object. The CRM changed how
connections are stored, in a way the sync cannot infer from the table alone.

The sync itself lives outside this repository. This file is the CRM side of the
contract: what the schema now guarantees, and what the sync has to preserve.

## What changed

A `connection` is a junction between two people, `personId` to `connectedToId`.
It used to hold one row per relationship. It now holds **two** — every
relationship is stored in both directions, because a person record shows all of
someone's connections through a single field that reads one direction only.

A new boolean field distinguishes them:

| `isReciprocal` | Meaning | `folkId` |
|---|---|---|
| `false` | The row a person or an import actually recorded | set on Folk-sourced rows |
| `true` | The generated reverse of such a row | **always null** |

A server listener maintains the generated side automatically:

- creating a connection generates its reverse within about 100ms
- deleting a connection deletes its generated reverse
- a reciprocal never generates a reciprocal of its own

Row counts roughly double as a result. At the time of writing, 305 recorded
connections and 303 generated reverses.

## Rules for the sync

1. **Never delete a row because it has no `folkId`.** Several hundred rows are
   generated reverses and legitimately have none. Deleting them leaves person
   records showing only half of someone's connections.

2. **Never write the reverse direction yourself.** If Folk reports both A to B
   and B to A, writing both produces a duplicate pair, because the listener has
   already created one of them. Write one direction and let the listener mirror
   it.

3. **Deleting a recorded row is enough.** Its reverse goes with it. Deleting
   both is unnecessary and races the listener.

4. **Reconcile on `folkId` only.** Treat rows where it is null as outside the
   sync's ownership.

5. **Do not write `isReciprocal`.** It is set by the CRM.

## Checks after a run

The physical table is `_connection`, inside the workspace schema, not
`connection`. Find the schema with
`select "databaseSchema" from core."workspace"`, or avoid the question entirely
by going through the GraphQL API.

All three were run against a production mirror on 2026-08-06 and returned the
values given.

```sql
-- every recorded connection has its reverse; returned 0
select count(*) from "_connection" c
where c."deletedAt" is null and c."isReciprocal" is not true
  and not exists (
    select 1 from "_connection" r
    where r."deletedAt" is null
      and r."personId" = c."connectedToId"
      and r."connectedToId" = c."personId"
  );

-- the sync never owns a generated row; returned 0
select count(*) from "_connection"
where "deletedAt" is null and "isReciprocal" and "folkId" is not null;

-- duplicate pairs; returned 2, see below
select count(*) from (
  select "personId", "connectedToId" from "_connection"
  where "deletedAt" is null group by 1, 2 having count(*) > 1
) duplicated;
```

The last one is a **before-and-after comparison, not an expected zero.** Two
duplicate pairs already exist, both from Folk: `isReciprocal` false, `folkId`
set, all four rows written in the same instant of the 2026-07-03 import. Folk
imported those two relationships twice. What matters is that the count does not
grow, since a rule 2 violation shows up here first.

Run all three against staging before running against production. Staging
refreshes from production, so a full sync there is a faithful rehearsal.

## Open question

As of 2026-08-06 the interaction is untested. Every Folk-sourced connection was
created in one burst on 2026-07-03 and none has been updated since, while
Folk-sourced people are still updated daily. That is consistent both with the
sync never touching connections after the initial import, and with an idempotent
sync that has had nothing to write. The CRM side cannot tell which.

Whoever maintains the sync should confirm which it is. Until then, treat the
first connection-touching run as the moment this contract is actually exercised,
and check the counts above before and after.
