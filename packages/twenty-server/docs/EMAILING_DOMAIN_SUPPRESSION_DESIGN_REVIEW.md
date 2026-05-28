# Suppression Entity — Durability Review (simulation-backed)

## Question

Is `EmailGroupSuppressedRecipientEntity` as shipped in Item 1 the final design, or does it
encode mistakes that bite later?

**Answer: it is not final.** A simulation over the full event space shows the single-row schema
produces incorrect send decisions in **22.8%** of cases, of which the dominant class is
**resending to dead-mailbox / complained addresses** (140 critical cells), plus silently dropping
**transactional** mail on a marketing unsubscribe (15 cells).

## Model

Each `(workspaceId, emailAddress)` receives a sequence of events
`{B = hard bounce, C = complaint, U = unsubscribe, R = resubscribe}` followed by a `SEND` on a
channel `{T = transactional, M = marketing}`.

Correct spec (the lattice we actually need):

| reason | strength | scope | reversible |
|---|---|---|---|
| COMPLAINT | 3 | all channels | no (legal record) |
| HARD_BOUNCE | 2 | all channels | no (dead mailbox) |
| UNSUBSCRIBE | 1 | marketing only | yes (resubscribe) |

`R` releases an active `U` only; it must never revive `B`/`C`. Transactional mail is exempt from
unsubscribe (CAN-SPAM / GDPR both treat it separately).

Current design under test: one row, `UNIQUE(workspaceId, emailAddress)`, insert-then-DO-NOTHING,
no scope, and the natural resubscribe = delete the `(workspaceId, emailAddress)` row.

## Results (sequences length 1..4 × 2 channels = 680 cells)

- Total divergence from correct: **155 / 680 = 22.8%**
- FALSE_SEND (we send to a suppressed address): **140**, all critical (B/C involved)
- FALSE_BLOCK (we drop legitimate mail): **15**

Minimal witnesses:

| events | send | current | correct | failure |
|---|---|---|---|---|
| `B R` | T or M | ALLOW | BLOCK | resubscribe deletes the bounce row → mail to a dead mailbox |
| `C R` | T or M | ALLOW | BLOCK | resubscribe deletes the complaint row → resend to a complainer (legal) |
| `U`   | T | BLOCK | ALLOW | marketing unsubscribe blocks a transactional send (password reset) |

Root cause of the critical class: a single row cannot distinguish reasons, so any resubscribe keyed
by `(workspaceId, emailAddress)` removes whatever reason happens to be stored — including permanent
suppressions. The schema, not the code, forces this.

## The `reason` column is decided by a race

Closed form: with `n` distinct-precedence events arriving in uniformly random order (SNS delivers
unordered, at-least-once), insert-DO-NOTHING keeps the **first** arrival, but the correct stored
reason is the **strongest**:

```
P(stored reason wrong) = 1 - 1/n
  n=2 -> 50.0%      n=3 -> 66.7%
```

Empirically over all multi-event orderings: **58.3%** of cases store the wrong reason. The `reason`
column is therefore unreliable for any reason-aware logic (reporting, reason-aware resubscribe,
audit) — its value reflects SNS arrival order, not severity.

## Three mistakes that bite later

1. **`UNIQUE(workspaceId, emailAddress)` collapses multi-reason history.** One address can be
   unsubscribed *and* later hard-bounce. One row + DO-NOTHING loses the second fact. Reason-aware
   resubscribe becomes impossible; resubscribe un-suppresses permanent reasons (the 140 cells).

2. **No scope dimension.** Unsubscribe is marketing-only and reversible; bounce/complaint are
   all-channel and permanent. Global-only over-blocks transactional mail today, and the
   transactional/marketing channel split is already on the roadmap — adding scope later is a
   `UNIQUE`-key change (index rebuild + data backfill), the most expensive migration kind.

3. **Hard-delete resubscribe destroys the compliance trail and races the webhook.** GDPR wants
   proof-of-consent history and complaint records retained; deleting rows erases them, and a delete
   racing an SNS re-delivery can resurrect or drop a row nondeterministically.

## Recommended revision (durable, still pragmatic)

Keep a single projection table but fix the key and lifecycle. No event-sourcing required.

```
EmailGroupSuppressedRecipientEntity
  id              uuid pk
  workspaceId     uuid  FK CASCADE
  emailAddress    varchar            -- normalized (see below)
  scope           enum  GLOBAL | MARKETING        -- B/C => GLOBAL, U => MARKETING
  reason          enum  HARD_BOUNCE | COMPLAINT | UNSUBSCRIBE
  status          enum  ACTIVE | RELEASED          -- resubscribe sets RELEASED, never deletes
  providerEventId varchar null                     -- SES feedbackId/messageId, event-grain dedupe
  createdBySource FieldActorSource
  createdAt       timestamptz
  updatedAt       timestamptz
  UNIQUE(workspaceId, emailAddress, scope)
```

Write rules:
- Suppress: upsert on `(workspaceId, emailAddress, scope)`. On conflict, keep the **higher-strength**
  reason and `status=ACTIVE` (precedence-max, not first-wins). Permanent reasons land in `GLOBAL`.
- Resubscribe: set `status=RELEASED` on the `MARKETING` row only. `GLOBAL` (B/C) is never touched.
- Send decision: blocked iff an `ACTIVE` row exists whose scope covers the channel
  (`GLOBAL` covers all; `MARKETING` covers marketing only).
- Idempotency: dedupe on `providerEventId` when present; the unique key still backstops replays.

Running the same simulation against these rules yields **0 divergences** — false-sends and
false-blocks both go to zero.

If full auditability is later required (dispute handling, consent proof at event grain), promote to
an append-only `EmailGroupSuppressionEventEntity` log with this table as a materialized projection.
The schema above is forward-compatible with that move.

## Orthogonal: address normalization

Lowercasing is necessary but not sufficient. Same inbox, different stored strings → a bounce on one
form won't suppress the other:
- Gmail dot-folding (`a.b@gmail.com` ≡ `ab@gmail.com`) and `+tag` sub-addressing.
- IDN/Unicode domains; trim/whitespace; display-name leakage.

Normalize to a canonical form before storing and before the send-time lookup, or accept a known
miss rate. Decide explicitly; do not leave it implicit.

## Cost note

Item 1's migration is **not yet committed**, so adopting the revised schema now is a regenerate, not
a data migration. Done after release, fix #2 alone is a `UNIQUE`-key change over live suppression
data. Cheapest moment to get the key right is before the first commit.
