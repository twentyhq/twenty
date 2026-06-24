# Logic Function KV Store

This document describes the **KV store** — a small key-value storage object that
logic functions can use to persist data between invocations (caching, webhook
idempotency, cursors, intermediate results, …).

It is a **design / implementation guide**: it documents the developer-facing API
and how to wire it through Twenty's existing logic-function architecture. The KV
store is not implemented yet — this doc is the reference for building it.

> The public API intentionally mirrors
> [Attio's KV store](https://docs.attio.com/sdk/server/kv-store) so that the
> mental model is familiar and porting code is trivial.

---

## 1. Goals

- Give logic-function authors a simple, persistent place to **store and read
  data** across invocations, without standing up their own database.
- Keep the API **tiny and predictable**: `get`, `set`, `delete`.
- Support **TTL** (time-to-live) so authors can cache values that expire on their
  own.
- Stay **isolated per workspace and per application** so one app can never read
  another app's data.

### Non-goals

- This is **not** a general-purpose cache layer for the server itself. It is
  storage exposed *to logic functions*.
- It is **not** built on the Redis cache. The server's Redis cache
  (`packages/twenty-server/src/engine/core-modules/cache-storage/`) is volatile
  and operational; logic-function data must be **durable**, so the KV store is
  backed by **PostgreSQL** (see [Why Postgres, not Redis](#5-why-postgres-not-redis)).

---

## 2. Developer-facing API

Logic functions reach the KV store through a single object imported from the
SDK runtime barrel (`twenty-sdk/logic-function`), exactly like the existing
`getConnection` / `runAgent` helpers.

```ts
import { kvStore } from 'twenty-sdk/logic-function';
```

The object exposes three methods. **All values are strings** — serialize with
`JSON.stringify` / `JSON.parse` yourself when storing objects.

### `kvStore.get(key)`

```ts
get(key: string): Promise<{ value: string } | null>;
```

Reads the value stored at `key`. Resolves to `null` when the key does not exist
or has expired.

```ts
const cached = await kvStore.get('exchange-rates');

if (cached !== null) {
  return JSON.parse(cached.value);
}
```

### `kvStore.set(key, value, options?)`

```ts
set(
  key: string,
  value: string,
  options?: { ttlInSeconds?: number },
): Promise<void>;
```

Stores `value` at `key`, overwriting any existing value. When `ttlInSeconds` is
provided, the entry is automatically deleted after that many seconds.

```ts
// Cache for 30 days
await kvStore.set('exchange-rates', JSON.stringify(rates), {
  ttlInSeconds: 2_592_000,
});

// Store with no expiry
await kvStore.set('last-sync-cursor', cursor);
```

### `kvStore.delete(key)`

```ts
delete(key: string): Promise<void>;
```

Removes `key` from the store. Deleting a missing key is a no-op (does not throw).

```ts
await kvStore.delete('exchange-rates');
```

---

## 3. Usage examples

### Caching an external API response

```ts
import { defineLogicFunction } from 'twenty-sdk/define';
import { kvStore } from 'twenty-sdk/logic-function';
import type { RoutePayload } from 'twenty-sdk/logic-function';

const handler = async (_params: RoutePayload) => {
  const cached = await kvStore.get('exchange-rates');
  if (cached !== null) {
    return JSON.parse(cached.value);
  }

  const response = await fetch('https://api.example.com/rates');
  const rates = await response.json();

  // Refresh at most once a day
  await kvStore.set('exchange-rates', JSON.stringify(rates), {
    ttlInSeconds: 86_400,
  });

  return rates;
};

export default defineLogicFunction({
  universalIdentifier: '…',
  name: 'get-exchange-rates',
  handler,
  httpRouteTriggerSettings: { path: '/rates', httpMethod: 'GET' },
});
```

### Webhook idempotency

```ts
const handler = async (params: RoutePayload) => {
  const eventId = params.headers['x-event-id'];
  const seen = await kvStore.get(`webhook:${eventId}`);

  if (seen !== null) {
    return { status: 'duplicate-ignored' };
  }

  // Remember this event for 24h so retries are ignored
  await kvStore.set(`webhook:${eventId}`, '1', { ttlInSeconds: 86_400 });

  // … process the webhook …
  return { status: 'processed' };
};
```

---

## 4. Architecture overview

Logic functions run in an isolated runtime (AWS Lambda or a local child process)
and **cannot touch the database directly**. Every capability they have — querying
records, reading connections, running agents — works by calling **back into the
Twenty server over GraphQL**, authenticated with a short-lived,
application-scoped access token that the executor injects into the function's
environment.

The KV store follows the **exact same pattern**. There is nothing new to invent:

```
┌─────────────────────────────┐         GraphQL (/metadata)          ┌──────────────────────────────┐
│  Logic function runtime      │   Authorization: Bearer <appToken>   │  Twenty server                │
│  (Lambda / local process)    │ ───────────────────────────────────▶ │                               │
│                              │                                      │  KvStoreResolver              │
│  kvStore.get / set / delete  │ ◀─────────────────────────────────── │       │                       │
│  (twenty-sdk helper)         │            value / null               │  KvStoreService               │
└─────────────────────────────┘                                      │       │                       │
                                                                     │  PostgreSQL (core schema)     │
                                                                     │  logicFunctionKvEntry table   │
                                                                     └──────────────────────────────┘
```

The pieces that need to be added:

| Layer | What to add | Where |
| --- | --- | --- |
| **SDK runtime** | `kvStore` helper that calls GraphQL | `packages/twenty-sdk/src/sdk/logic-function/kv-store/` |
| **GraphQL API** | `kvStoreGet` / `kvStoreSet` / `kvStoreDelete` resolver | `packages/twenty-server/src/engine/metadata-modules/logic-function/` |
| **Service** | Read/write/TTL logic | same module |
| **Persistence** | `LogicFunctionKvEntry` entity + migration | core schema |

The KV store reuses the existing app token and the existing `/metadata` GraphQL
endpoint that `postGraphqlRequest` already targets — so authentication, scoping
to the calling application, and transport are all **already solved**.

---

## 5. Why Postgres, not Redis

The server already has a Redis-backed cache
(`cache-storage/`, exposed via NestJS `CACHE_MANAGER`). We deliberately **do not**
use it for the KV store:

- **Durability.** The Redis cache is treated as disposable/operational state and
  can be flushed or evicted under memory pressure. Authors storing a sync cursor
  or an idempotency marker expect it to survive — that is a database guarantee,
  not a cache guarantee.
- **Tenant isolation & lifecycle.** KV entries must be scoped to a workspace and
  application, and must be cleaned up when an application is uninstalled or a
  workspace is deleted. Modeling this as a real table gives us foreign keys,
  cascade deletes, and queryability for free.
- **Auditability & limits.** A table lets us enforce per-app quotas, inspect
  usage, and back up the data alongside the rest of the workspace.

TTL is therefore implemented **at the application layer** (an `expiresAt` column
+ lazy expiry on read, plus a periodic sweep), not via Redis key expiry.

---

## 6. Data model

A single core-schema table, scoped by workspace + application + key.

```ts
// packages/twenty-server/.../logic-function/kv-store/logic-function-kv-entry.entity.ts
@Entity({ name: 'logicFunctionKvEntry', schema: 'core' })
@Unique('IDX_KV_ENTRY_WORKSPACE_APP_KEY', ['workspaceId', 'applicationId', 'key'])
export class LogicFunctionKvEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'uuid' })
  applicationId: string;

  @Column({ type: 'varchar' })
  key: string;

  // Stored as text; the public API only deals in strings.
  @Column({ type: 'text' })
  value: string;

  // Null = never expires. Set from `ttlInSeconds` on write.
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
```

Notes:

- The `(workspaceId, applicationId, key)` unique index makes `set` an upsert and
  guarantees **isolation**: an app's key space never collides with another app's.
- `expiresAt` is computed on write as `now + ttlInSeconds`. A `null` value means
  the entry never expires.
- Adding/altering this entity requires generating an **instance command** (see
  `UPGRADE_COMMANDS.md`): `database:migrate:generate --name add-logic-function-kv-entry --type fast`.

---

## 7. GraphQL API

Three operations exposed on the **metadata** schema (the endpoint logic functions
already call). The calling application is derived **server-side** from the app
access token — clients never pass `applicationId`, which is what enforces
scoping.

```graphql
type KvEntry {
  value: String!
}

extend type Query {
  kvStoreGet(key: String!): KvEntry
}

extend type Mutation {
  kvStoreSet(key: String!, value: String!, ttlInSeconds: Int): Boolean!
  kvStoreDelete(key: String!): Boolean!
}
```

`KvStoreService` responsibilities:

- **get**: look up `(workspaceId, applicationId, key)`. If found and
  `expiresAt` is in the past, treat it as missing (and optionally delete it
  lazily). Return `{ value }` or `null`.
- **set**: upsert on the unique index; set `expiresAt = now + ttlInSeconds` when
  provided, else `null`.
- **delete**: delete by `(workspaceId, applicationId, key)`; no error if absent.

A periodic job (e.g. a cron command) sweeps rows where `expiresAt < now()` so
expired data does not accumulate.

---

## 8. SDK helper implementation

The runtime helper mirrors `get-connection.ts`: it builds a GraphQL request and
delegates to `postGraphqlRequest`, which already reads the injected
`TWENTY_API_URL` / `TWENTY_APP_ACCESS_TOKEN` env vars and posts to `/metadata`.

```ts
// packages/twenty-sdk/src/sdk/logic-function/kv-store/kv-store.ts
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const GET = `query KvStoreGet($key: String!) { kvStoreGet(key: $key) { value } }`;
const SET = `mutation KvStoreSet($key: String!, $value: String!, $ttlInSeconds: Int) {
  kvStoreSet(key: $key, value: $value, ttlInSeconds: $ttlInSeconds)
}`;
const DELETE = `mutation KvStoreDelete($key: String!) { kvStoreDelete(key: $key) }`;

export const kvStore = {
  get: async (key: string): Promise<{ value: string } | null> => {
    const { kvStoreGet } = await postGraphqlRequest<
      { key: string },
      { kvStoreGet: { value: string } | null }
    >({ query: GET, variables: { key }, caller: 'kvStore.get' });

    return kvStoreGet;
  },

  set: async (
    key: string,
    value: string,
    options?: { ttlInSeconds?: number },
  ): Promise<void> => {
    await postGraphqlRequest({
      query: SET,
      variables: { key, value, ttlInSeconds: options?.ttlInSeconds ?? null },
      caller: 'kvStore.set',
    });
  },

  delete: async (key: string): Promise<void> => {
    await postGraphqlRequest({
      query: DELETE,
      variables: { key },
      caller: 'kvStore.delete',
    });
  },
};
```

Then export it from the runtime barrel so authors can import it:

```ts
// packages/twenty-sdk/src/sdk/logic-function/index.ts
export { kvStore } from '@/sdk/logic-function/kv-store/kv-store';
```

No change is needed to the executor or the function payload: the helper relies
only on env vars that are **already injected** today.

---

## 9. Scoping, limits & semantics

- **Isolation** — entries are keyed by `(workspaceId, applicationId, key)`. The
  workspace and application are taken from the app access token on the server, so
  a function can only ever read/write its own application's keys within its own
  workspace.
- **Values are strings** — same contract as Attio. Serialize structured data
  with `JSON.stringify`.
- **Overwrite semantics** — `set` replaces the existing value (and resets/clears
  the TTL based on the new call's options).
- **Expiry** — expired entries read back as `null`; they are removed lazily on
  read and by a periodic sweep.
- **Suggested guardrails** (enforce in `KvStoreService`):
  - max key length (e.g. 512 chars)
  - max value size (e.g. 256 KB)
  - optional per-application entry/byte quota
- **Consistency** — backed by Postgres, so reads are read-your-writes consistent
  within a workspace.

---

## 10. Implementation checklist

1. **Entity + migration** — add `LogicFunctionKvEntry` and generate a fast
   instance command (`UPGRADE_COMMANDS.md`).
2. **Service** — `KvStoreService` with `get` / `set` / `delete` + lazy expiry and
   guardrails.
3. **Resolver** — `kvStoreGet` query and `kvStoreSet` / `kvStoreDelete` mutations
   on the metadata schema, resolving `workspaceId` / `applicationId` from the app
   token.
4. **Sweep job** — periodic command to delete rows where `expiresAt < now()`.
5. **Cascade cleanup** — delete an application's entries on uninstall, and a
   workspace's entries on workspace deletion.
6. **SDK helper** — `kvStore` object + barrel export from
   `twenty-sdk/logic-function`.
7. **Docs** — add a developer-facing page under
   `packages/twenty-docs/developers/extend/apps/logic/` once the feature ships.
8. **Tests** — service unit tests (TTL, isolation, upsert) and a logic-function
   integration test that round-trips a value.
```
