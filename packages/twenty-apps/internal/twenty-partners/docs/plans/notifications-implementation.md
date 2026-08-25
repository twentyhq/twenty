# Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship (1) an instant Discord ping when a brief is hand-listed on the marketplace and (2) an app-seeded Daily Digest workflow that emails validated partners the daily count of new briefs.

**Architecture:** Feature 2 is additive app code: one database-event logic function on the `isListed` false→true flip, calling a best-effort Discord service; the existing in-route form ping stays untouched. Feature 1 seeds a hand-built cron workflow from a JSON template via the core API and activates it with `activateWorkflowVersion` (no user guard — API key with the `WORKFLOWS` flag suffices).

**Tech Stack:** twenty-sdk (`defineLogicFunction`, database event triggers), twenty-client-sdk (`CoreApiClient`), raw GraphQL fetch for core mutations not in the generated schema, vitest, tsx scripts.

**Spec:** `docs/plans/notifications.md` (same directory). Read it first.

## Global Constraints

- Working directory for all commands: `packages/twenty-apps/internal/twenty-partners`.
- **Single-record reads are banned.** Every record read uses the list form: `filter: { id: { eq } }, first: 1, edges.node`. The single form throws `Record not found`.
- Discord and email failures are best-effort: they must never fail a trigger or a request.
- Comments: `//` only, WHY only, at most one short line where genuinely surprising.
- No AI attribution anywhere (commits, code, docs). CI rejects it.
- Do not commit `docs/plans/*` — planning artifacts stay untracked.
- Do not commit translation catalogs (`*.po`, `locales/generated/*`).
- Tests: `npx vitest run --project unit <file>` for one file, `yarn test:unit` for the suite. Typecheck: `npx tsc -p tsconfig.json --noEmit`.
- New universal identifiers are fresh random UUIDs declared in `src/constants/universal-identifiers.ts`.
- User-facing copy in this app is plain English (no Lingui here — scripts and Discord embeds are ops-facing).

---

### Task 1: Listed-brief Discord service + query

**Files:**
- Create: `src/modules/opportunity/matching/graphql/queries/get-listed-brief-details.ts`
- Create: `src/modules/opportunity/matching/services/notify-listed-brief.service.ts`
- Test: `src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts`

**Interfaces:**
- Consumes: `postWebhook(url, payload, label, timeoutMs?)` from `src/modules/shared/connector/discord/discord.connector`; `DISCORD_WEBHOOK_ENV_VAR`, `TWENTY_BLUE` from `.../discord/config`; `isNonEmptyString` from `src/modules/shared/utils/is-non-empty-string.util`.
- Produces: `notifyListedBrief(opportunityId: string): Promise<void>` — never throws.

- [ ] **Step 1: Write the failing tests**

```ts
// src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, postWebhookMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  postWebhookMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));
vi.mock('src/modules/shared/connector/discord/discord.connector', () => ({
  postWebhook: postWebhookMock,
}));

import { notifyListedBrief } from './notify-listed-brief.service';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';

const briefResult = (node: Record<string, unknown> | undefined) => ({
  opportunities: { edges: node === undefined ? [] : [{ node }] },
});

describe('notifyListedBrief', () => {
  beforeEach(() => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.test/hook');
    vi.stubEnv('PARTNER_APP_FRONTEND_URL', 'https://crm.test/');
    queryMock.mockReset();
    postWebhookMock.mockReset();
    postWebhookMock.mockResolvedValue(true);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('posts one embed built from the record', async () => {
    queryMock.mockResolvedValue(
      briefResult({
        id: OPP,
        name: 'Acme — marketplace brief',
        need: 'Migrate 40 seats to Twenty',
        requirements: 'Hosting: Cloud\nSeats: 40',
        company: { name: 'Acme' },
        pointOfContact: { name: { firstName: 'Jane', lastName: 'Doe' } },
        referredByPartner: { name: 'Meridian Craft' },
      }),
    );
    await notifyListedBrief(OPP);
    expect(postWebhookMock).toHaveBeenCalledTimes(1);
    const [url, payload, label] = postWebhookMock.mock.calls[0];
    expect(url).toBe('https://discord.test/hook');
    expect(label).toBe('notify-listed-brief');
    const embed = payload.embeds[0];
    expect(embed.title).toBe('Brief listed on the marketplace');
    expect(embed.description).toBe('Migrate 40 seats to Twenty');
    expect(embed.url).toBe(`https://crm.test/object/opportunity/${OPP}`);
    expect(embed.fields).toEqual([
      { name: 'Company', value: 'Acme', inline: true },
      { name: 'Contact', value: 'Jane Doe', inline: true },
      { name: 'Referred by', value: 'Meridian Craft', inline: true },
      { name: 'Requirements', value: 'Hosting: Cloud\nSeats: 40' },
    ]);
  });

  it('does nothing without a webhook url', async () => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', '');
    await notifyListedBrief(OPP);
    expect(queryMock).not.toHaveBeenCalled();
    expect(postWebhookMock).not.toHaveBeenCalled();
  });

  it('returns silently when the opportunity is missing (empty edges)', async () => {
    queryMock.mockResolvedValue(briefResult(undefined));
    await expect(notifyListedBrief(OPP)).resolves.toBeUndefined();
    expect(postWebhookMock).not.toHaveBeenCalled();
  });

  it('swallows a read failure', async () => {
    queryMock.mockRejectedValue(new Error('boom'));
    await expect(notifyListedBrief(OPP)).resolves.toBeUndefined();
  });

  it('swallows a webhook failure', async () => {
    queryMock.mockResolvedValue(briefResult({ id: OPP, name: 'n', need: 'x' }));
    postWebhookMock.mockRejectedValue(new Error('discord down'));
    await expect(notifyListedBrief(OPP)).resolves.toBeUndefined();
  });

  it('omits empty fields and falls back to the name as description', async () => {
    queryMock.mockResolvedValue(briefResult({ id: OPP, name: 'Acme — marketplace brief' }));
    await notifyListedBrief(OPP);
    const embed = postWebhookMock.mock.calls[0][1].embeds[0];
    expect(embed.description).toBe('Acme — marketplace brief');
    expect(embed.fields).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run --project unit src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts`
Expected: FAIL — cannot resolve `./notify-listed-brief.service`.

- [ ] **Step 3: Write the query**

```ts
// src/modules/opportunity/matching/graphql/queries/get-listed-brief-details.ts
import type { CoreApiClient } from 'twenty-client-sdk/core';

// List form on purpose: the single-record read throws `Record not found` for an unknown id.
export function getListedBriefDetails(client: CoreApiClient, opportunityId: string) {
  return client.query({
    opportunities: {
      __args: { filter: { id: { eq: opportunityId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          need: true,
          requirements: true,
          company: { name: true },
          pointOfContact: { name: { firstName: true, lastName: true } },
          referredByPartner: { name: true },
        },
      },
    },
  });
}
```

- [ ] **Step 4: Write the service**

```ts
// src/modules/opportunity/matching/services/notify-listed-brief.service.ts
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  DISCORD_WEBHOOK_ENV_VAR,
  TWENTY_BLUE,
} from 'src/modules/shared/connector/discord/config';
import { postWebhook } from 'src/modules/shared/connector/discord/discord.connector';
import { type DiscordField } from 'src/modules/shared/connector/discord/types';
import { getListedBriefDetails } from 'src/modules/opportunity/matching/graphql/queries/get-listed-brief-details';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

const NEED_MAX = 600;
const REQUIREMENTS_MAX = 300;

const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, max - 1)}…`;

const inline = (name: string, value: string | undefined | null): DiscordField[] =>
  isNonEmptyString(value) ? [{ name, value, inline: true }] : [];

export async function notifyListedBrief(opportunityId: string): Promise<void> {
  const webhookUrl = process.env[DISCORD_WEBHOOK_ENV_VAR];
  if (!isNonEmptyString(webhookUrl)) return;

  try {
    const result = await getListedBriefDetails(new CoreApiClient(), opportunityId);
    const brief = result.opportunities?.edges?.[0]?.node;
    if (!brief) return;

    const contact = [brief.pointOfContact?.name?.firstName, brief.pointOfContact?.name?.lastName]
      .filter(isNonEmptyString)
      .join(' ');
    const fields: DiscordField[] = [
      ...inline('Company', brief.company?.name),
      ...inline('Contact', contact),
      ...inline('Referred by', brief.referredByPartner?.name),
    ];
    if (isNonEmptyString(brief.requirements)) {
      fields.push({ name: 'Requirements', value: truncate(brief.requirements.trim(), REQUIREMENTS_MAX) });
    }

    const embed: Record<string, unknown> = {
      title: 'Brief listed on the marketplace',
      description: isNonEmptyString(brief.need) ? truncate(brief.need.trim(), NEED_MAX) : brief.name,
      color: TWENTY_BLUE,
      timestamp: new Date().toISOString(),
      fields,
    };
    const frontendUrl = process.env.PARTNER_APP_FRONTEND_URL;
    if (isNonEmptyString(frontendUrl)) {
      embed.url = `${frontendUrl.replace(/\/+$/, '')}/object/opportunity/${brief.id}`;
    }

    await postWebhook(webhookUrl, { embeds: [embed] }, 'notify-listed-brief');
  } catch {
    // Best-effort: a read or Discord failure must never fail the trigger.
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run --project unit src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts`
Expected: 6 passed.

- [ ] **Step 6: Typecheck, then commit**

Run: `npx tsc -p tsconfig.json --noEmit`

```bash
git add src/modules/opportunity/matching/graphql/queries/get-listed-brief-details.ts \
        src/modules/opportunity/matching/services/notify-listed-brief.service.ts \
        src/modules/opportunity/matching/services/notify-listed-brief.service.test.ts
git commit -m "feat(partners): add a record-based Discord ping for listed briefs"
```

---

### Task 2: `on-opportunity-listed` logic function

**Files:**
- Modify: `src/constants/universal-identifiers.ts` (one new constant, next to `ON_OPPORTUNITY_INTRO_SENT_FN_UNIVERSAL_IDENTIFIER`)
- Create: `src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts`
- Test: `src/modules/opportunity/matching/on-opportunity-listed.test.ts`

**Interfaces:**
- Consumes: `notifyListedBrief(opportunityId: string): Promise<void>` from Task 1.
- Produces: the default export registers itself in the manifest at `yarn twenty apply` — no code consumer.

- [ ] **Step 1: Add the identifier constant**

```ts
// in src/constants/universal-identifiers.ts, after ON_OPPORTUNITY_INTRO_SENT_FN_UNIVERSAL_IDENTIFIER
export const ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER = 'ebbb2911-57e5-4edd-bd93-4a28939115c0';
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/modules/opportunity/matching/on-opportunity-listed.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { notifyMock } = vi.hoisted(() => ({ notifyMock: vi.fn() }));
vi.mock('src/modules/opportunity/matching/services/notify-listed-brief.service', () => ({
  notifyListedBrief: notifyMock,
}));

import { handler } from './on-opportunity-listed.logic-function';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';

const event = (
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  updatedFields: string[] = ['isListed'],
) => ({ properties: { before, after, updatedFields } }) as never;

describe('on-opportunity-listed', () => {
  beforeEach(() => {
    notifyMock.mockReset();
    notifyMock.mockResolvedValue(undefined);
  });

  it('notifies when isListed flips from false to true', async () => {
    const result = await handler(event({ id: OPP, isListed: false }, { id: OPP, isListed: true }));
    expect(notifyMock).toHaveBeenCalledWith(OPP);
    expect(result).toEqual({ notified: true, opportunityId: OPP });
  });

  it('stays silent when isListed flips to false', async () => {
    const result = await handler(event({ id: OPP, isListed: true }, { id: OPP, isListed: false }));
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'not_a_listing_flip' });
  });

  it('stays silent when isListed was already true', async () => {
    const result = await handler(event({ id: OPP, isListed: true }, { id: OPP, isListed: true }));
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'not_a_listing_flip' });
  });

  it('returns without notifying when the payload carries no record id', async () => {
    const result = await handler(event({ isListed: false }, { isListed: true }));
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('returns without notifying when isListed is not in updatedFields', async () => {
    const result = await handler(
      event({ id: OPP, isListed: true }, { id: OPP, isListed: true }, ['stage']),
    );
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run --project unit src/modules/opportunity/matching/on-opportunity-listed.test.ts`
Expected: FAIL — cannot resolve `./on-opportunity-listed.logic-function`.

- [ ] **Step 4: Write the logic function**

```ts
// src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts
import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { notifyListedBrief } from 'src/modules/opportunity/matching/services/notify-listed-brief.service';

// The public form is NOT this function's job: form briefs are born listed and never
// flip, so the in-route ping covers them. This covers hand-listing and imports.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Opportunity>>,
): Promise<Record<string, unknown>> => {
  const { before, after, updatedFields } = payload.properties;
  if (!updatedFields?.includes('isListed') || !after?.id) return {};
  if (before?.isListed === true || after.isListed !== true) {
    return { skipped: true, reason: 'not_a_listing_flip' };
  }

  await notifyListedBrief(after.id);
  return { notified: true, opportunityId: after.id };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-listed',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['isListed'],
  },
});
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run --project unit src/modules/opportunity/matching/on-opportunity-listed.test.ts`
Expected: 5 passed. Then run the full unit suite: `yarn test:unit` — no regressions.

- [ ] **Step 6: Typecheck, then commit**

Run: `npx tsc -p tsconfig.json --noEmit`

```bash
git add src/constants/universal-identifiers.ts \
        src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts \
        src/modules/opportunity/matching/on-opportunity-listed.test.ts
git commit -m "feat(partners): ping Discord when a brief is hand-listed on the marketplace"
```

---

### Task 3: Hand-build the Daily Digest and dump it as a template

**⚠️ This task needs the user.** Building the workflow and connecting a mailbox happen in the workspace UI. Stop and ask the user to do (or pair on) the manual part; do not fake the template.

**Files:**
- Create: `src/scripts/dump-daily-digest-workflow.ts`
- Create: `src/scripts/templates/daily-digest.workflow.json` (output of the dump)
- Modify: `package.json` (one script entry)

**Interfaces:**
- Produces: `daily-digest.workflow.json` with shape `{ "trigger": {...}, "steps": [...] }` — Task 4 consumes it verbatim.

- [ ] **Step 1: Manual prerequisite (user): connect a mailbox**

In the local workspace (Settings → Accounts), connect the sender mailbox. Credentials are typed by the user, never by the agent.

- [ ] **Step 2: Manual build (user, per the spec)**

Settings → Workflows → new workflow named exactly `Daily Digest`:
1. Cron trigger, daily at 07:00.
2. Find Records on Opportunity: `isListed = true` AND `createdAt` in the last day.
3. Stop step when the count from step 2 is zero.
4. The app's **List digest recipients** step (shipped by Task 6 — apply must have run).
5. Iterator with items = the `recipients` array from step 4, containing a Send Email action from the connected mailbox with `to = {{currentItem.email}}`. Subject and body reference the count from step 2 and link to the partner workspace (use the PROD URL — the template travels to prod as-is).
6. Publish the version.

- [ ] **Step 3: Write the dump script**

```ts
// src/scripts/dump-daily-digest-workflow.ts
// Dumps the hand-built Daily Digest workflowVersion (trigger + steps) into the
// template consumed by seed-daily-digest-workflow.ts. Re-run after rebuilding
// the workflow (e.g. after a Twenty upgrade changed the steps format).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

async function coreFetch<T>(query: string): Promise<T> {
  const baseUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}`,
    },
    body: JSON.stringify({ query }),
  });
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  return json.data;
}

type VersionNode = { id: string; status: string; trigger: unknown; steps: unknown };

async function main() {
  const data = await coreFetch<{
    workflows: { edges: { node: { id: string; versions: { edges: { node: VersionNode }[] } } }[] };
  }>(
    `{ workflows(filter: { name: { eq: "Daily Digest" } }, first: 1) {
        edges { node { id versions(first: 20) { edges { node { id status trigger steps } } } } } } }`,
  );

  const workflow = data.workflows?.edges?.[0]?.node;
  if (!workflow) throw new Error('No workflow named "Daily Digest" — build it first (see docs/plans/notifications.md).');

  const versions = workflow.versions.edges.map((edge) => edge.node);
  const version = versions.find((v) => v.status === 'ACTIVE') ?? versions[versions.length - 1];
  if (!version?.trigger || !version.steps) throw new Error('The version has no trigger or steps — publish it first.');

  const outPath = join(import.meta.dirname, 'templates', 'daily-digest.workflow.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify({ trigger: version.trigger, steps: version.steps }, null, 2)}\n`);
  console.log(`[digest:dump] wrote ${outPath} (version ${version.id}, status ${version.status})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 4: Register the script**

In `package.json` scripts, next to the `rls:configure` entries:

```json
"digest:dump": "tsx src/scripts/dump-daily-digest-workflow.ts",
```

- [ ] **Step 5: Run the dump and inspect the template**

Run: `yarn digest:dump`
Expected: `src/scripts/templates/daily-digest.workflow.json` exists, contains a cron trigger and steps including one send-email step with a `connectedAccountId` value. Inspect it: the mailbox id and any workspace-specific record ids inside are the parts Task 4 must inject or tolerate.

- [ ] **Step 6: Typecheck, then commit (script + template, not the plan)**

Run: `npx tsc -p tsconfig.json --noEmit`

```bash
git add src/scripts/dump-daily-digest-workflow.ts src/scripts/templates/daily-digest.workflow.json package.json
git commit -m "feat(partners): dump the Daily Digest workflow as a seed template"
```

---

### Task 4: Seed script — create and activate the digest in any workspace

**Files:**
- Create: `src/scripts/seed-daily-digest-workflow.ts`
- Create: `src/scripts/inject-connected-account.ts` (pure helper)
- Test: `src/scripts/inject-connected-account.test.ts`
- Modify: `package.json` (two script entries)

**Interfaces:**
- Consumes: `src/scripts/templates/daily-digest.workflow.json` from Task 3.
- Produces: `injectConnectedAccountId(steps: unknown, connectedAccountId: string): unknown` — pure, returns a deep copy with every `connectedAccountId` value replaced.

- [ ] **Step 1: Write the failing helper test**

```ts
// src/scripts/inject-connected-account.test.ts
import { describe, expect, it } from 'vitest';

import { injectConnectedAccountId } from './inject-connected-account';

describe('injectConnectedAccountId', () => {
  it('replaces every connectedAccountId at any depth and leaves the rest alone', () => {
    const steps = [
      { type: 'ITERATOR', settings: { input: { steps: [{ type: 'SEND_EMAIL', settings: { input: { connectedAccountId: 'old-id', subject: 's' } } }] } } },
      { type: 'FIND_RECORDS', settings: { input: { filter: 'x' } } },
    ];
    const result = injectConnectedAccountId(steps, 'new-id') as typeof steps;
    expect(JSON.stringify(result)).toContain('"connectedAccountId":"new-id"');
    expect(JSON.stringify(result)).not.toContain('old-id');
    expect(result[1]).toEqual(steps[1]);
    expect(steps[0].settings.input.steps[0].settings.input.connectedAccountId).toBe('old-id');
  });

  it('returns primitives untouched', () => {
    expect(injectConnectedAccountId('x', 'id')).toBe('x');
    expect(injectConnectedAccountId(null, 'id')).toBe(null);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run --project unit src/scripts/inject-connected-account.test.ts`
Expected: FAIL — cannot resolve `./inject-connected-account`.

- [ ] **Step 3: Write the helper**

```ts
// src/scripts/inject-connected-account.ts
// The dumped template carries the build workspace's mailbox id; every target
// workspace has its own, so the seed rewrites the id wherever it appears.
export function injectConnectedAccountId(value: unknown, connectedAccountId: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => injectConnectedAccountId(item, connectedAccountId));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        key === 'connectedAccountId' ? connectedAccountId : injectConnectedAccountId(entry, connectedAccountId),
      ]),
    );
  }
  return value;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run --project unit src/scripts/inject-connected-account.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Write the seed script**

```ts
// src/scripts/seed-daily-digest-workflow.ts
// Seeds the Daily Digest cron workflow from the dumped template and activates it.
// Idempotent: an already-active digest is a no-op; --force replaces it.
// activateWorkflowVersion has no user guard — the admin API key (WORKFLOWS flag) is enough.
//
// Usage:
//   yarn digest:seed            # against .env.local
//   yarn digest:seed:prod       # against .env.prod
//   yarn digest:seed --force    # deactivate the current version and re-seed
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { injectConnectedAccountId } from './inject-connected-account';

const WORKFLOW_NAME = 'Daily Digest';
const FORCE = process.argv.includes('--force');

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

async function coreFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const baseUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  return json.data;
}

type VersionNode = { id: string; status: string };

async function main() {
  // 1. A mailbox must exist — the send step is dead without one, and OAuth is human-only.
  const accounts = await coreFetch<{
    connectedAccounts: { edges: { node: { id: string; handle: string } }[] };
  }>(`{ connectedAccounts(first: 1) { edges { node { id handle } } } }`);
  const account = accounts.connectedAccounts?.edges?.[0]?.node;
  if (!account) {
    throw new Error('No connected mailbox in this workspace. Connect one (Settings → Accounts), then re-run.');
  }
  console.log(`[digest:seed] mailbox: ${account.handle}`);

  // 2. Existing workflow?
  const existing = await coreFetch<{
    workflows: { edges: { node: { id: string; versions: { edges: { node: VersionNode }[] } } }[] };
  }>(
    `{ workflows(filter: { name: { eq: "${WORKFLOW_NAME}" } }, first: 1) {
        edges { node { id versions(first: 20) { edges { node { id status } } } } } } }`,
  );
  let workflowId = existing.workflows?.edges?.[0]?.node?.id;
  const activeVersion = existing.workflows?.edges?.[0]?.node?.versions.edges
    .map((edge) => edge.node)
    .find((v) => v.status === 'ACTIVE');

  if (activeVersion && !FORCE) {
    console.log('[digest:seed] an active Daily Digest already exists — nothing to do (use --force to replace).');
    return;
  }
  if (activeVersion && FORCE) {
    await coreFetch(
      `mutation($id: UUID!) { deactivateWorkflowVersion(workflowVersionId: $id) }`,
      { id: activeVersion.id },
    );
    console.log(`[digest:seed] deactivated version ${activeVersion.id}`);
  }

  // 3. Workflow record.
  if (!workflowId) {
    const created = await coreFetch<{ createWorkflow: { id: string } }>(
      `mutation($data: WorkflowCreateInput!) { createWorkflow(data: $data) { id } }`,
      { data: { name: WORKFLOW_NAME } },
    );
    workflowId = created.createWorkflow.id;
    console.log(`[digest:seed] created workflow ${workflowId}`);
  }

  // 4. Version from the template, with this workspace's mailbox injected.
  const template = JSON.parse(
    readFileSync(join(import.meta.dirname, 'templates', 'daily-digest.workflow.json'), 'utf8'),
  ) as { trigger: unknown; steps: unknown };
  const version = await coreFetch<{ createWorkflowVersion: { id: string } }>(
    `mutation($data: WorkflowVersionCreateInput!) { createWorkflowVersion(data: $data) { id } }`,
    {
      data: {
        workflowId,
        name: 'seeded',
        trigger: template.trigger,
        steps: injectConnectedAccountId(template.steps, account.id),
      },
    },
  );
  console.log(`[digest:seed] created version ${version.createWorkflowVersion.id}`);

  // 5. Activate — this registers the cron.
  await coreFetch(
    `mutation($id: UUID!) { activateWorkflowVersion(workflowVersionId: $id) }`,
    { id: version.createWorkflowVersion.id },
  );
  console.log('[digest:seed] Daily Digest is active.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 6: Register the scripts**

In `package.json` scripts:

```json
"digest:seed": "tsx src/scripts/seed-daily-digest-workflow.ts",
"digest:seed:prod": "ENV_FILE=.env.prod tsx src/scripts/seed-daily-digest-workflow.ts",
```

- [ ] **Step 7: Live-verify against the local workspace**

Warning: deactivate or delete the hand-built version first when testing `--force`, so the seeded version is the one that runs.

1. Run `yarn digest:seed` with the hand-built version active → expect the no-op message.
2. Run `yarn digest:seed --force` → expect deactivate + create + activate logs.
3. In the UI, confirm the seeded version is ACTIVE, its send step points at the workspace mailbox, and the cron trigger shows daily at 07:00.
4. If the GraphQL field names differ from this plan's assumptions (`versions`, `WorkflowCreateInput`, `UUID!` — internal schema, possible drift), fix the queries against the live schema (introspect with a small query) rather than changing the script's structure. Record any rename in the report.

- [ ] **Step 8: Typecheck, run the unit suite, then commit**

Run: `npx tsc -p tsconfig.json --noEmit` and `yarn test:unit`

```bash
git add src/scripts/seed-daily-digest-workflow.ts src/scripts/inject-connected-account.ts \
        src/scripts/inject-connected-account.test.ts package.json
git commit -m "feat(partners): seed and activate the Daily Digest workflow from the template"
```

---

### Task 5: Runbook update, version bump, apply, live checks

**Files:**
- Modify: `src/workflows/README.md` (Daily Digest section + checklist row)
- Modify: `package.json` (version `1.7.6` → `1.8.0`)

**Interfaces:**
- Consumes: everything above; nothing produced for later tasks.

- [ ] **Step 1: Rewrite the Daily Digest section of the runbook**

Replace the "## 2. Daily digest" build steps with:

```markdown
## 2. Daily digest — seeded by the app

Nudges validated partners once a day when new briefs appear: count + link, no brief
details. Partners without a workspace account are skipped (the mail points at the
workspace, so they could not act on it).

The workflow is no longer built by hand. Per workspace:

1. Connect the sender mailbox once (Settings → Accounts). Human step — OAuth.
2. Run `yarn digest:seed` (or `yarn digest:seed:prod`). Idempotent; `--force` replaces
   the active version.

The template lives in `src/scripts/templates/daily-digest.workflow.json`. It is a dump
of a real workflow (`yarn digest:dump`) — the steps JSON is an internal Twenty format
with no compatibility promise. After a Twenty upgrade breaks it: rebuild the workflow by
hand once, `yarn digest:dump`, then `yarn digest:seed --force` everywhere.
```

Update the per-workspace checklist row for Daily Digest accordingly ("Run `digest:seed`" instead of manual build steps). Mark as Winner stays untouched.

- [ ] **Step 2: Bump the app version**

In `package.json`: `"version": "1.8.0"`.

- [ ] **Step 3: Apply and live-check feature 2**

Run: `yarn twenty apply`

Then in the local workspace:
1. Hand-tick `isListed` on an unlisted Opportunity → exactly one Discord ping with the record-based embed.
2. Untick then re-tick `isListed` → one more ping (a relist is a listing).
3. Submit the public brief form → exactly one ping (the existing rich embed, unchanged).
4. Check the function log on failure: `npx twenty dev:function:logs -n on-opportunity-listed`.

- [ ] **Step 4: Live-check feature 1 end-to-end**

Warning: restore the cron to daily after this check.

1. Temporarily edit the seeded workflow's cron to every minute (UI), or run the version once with a user session (`runWorkflowVersion` accepts users).
2. With ≥1 Opportunity listed today: each validated partner with a workspace account receives one email carrying the count.
3. With none listed today: no email leaves.

- [ ] **Step 5: Lint diff, full suite, commit**

Run: `npx nx lint:diff-with-main twenty-apps` (or the package's lint script), `yarn test:unit`, `npx tsc -p tsconfig.json --noEmit`

```bash
git add src/workflows/README.md package.json
git commit -m "feat(partners): 1.8.0 — seeded Daily Digest runbook and version bump"
```

---

## Self-review notes

- Spec coverage: instant ping (Tasks 1–2), digest hand-build + dump (Task 3), seed + activate + idempotency + `--force` + mailbox abort (Task 4), README + validation + zero-brief day check (Task 5). The spec's "out of scope" items appear in no task.
- The GraphQL shapes in Tasks 3–4 (`versions` relation, `WorkflowCreateInput`, `UUID!`) target an internal schema; Task 4 Step 7 names the drift risk and the fix path.
- Type consistency: `injectConnectedAccountId(value, connectedAccountId)` is defined in Task 4 Step 3 and used in Step 5 with the same signature; `notifyListedBrief(opportunityId)` is defined in Task 1 and consumed in Task 2.

---

### Task 6: `list-digest-recipients` workflow-action logic function (inserted — must land and be applied BEFORE Task 3's hand-build)

Why: the workflow Find Records step loads no relations, and Partner has no email column, so the workflow cannot resolve recipients itself. This function is the recipients source: the workflow calls it as a step and iterates its output.

**Files:**
- Modify: `src/constants/universal-identifiers.ts` (one new constant)
- Create: `src/modules/partner/marketplace/graphql/queries/get-digest-recipients.ts`
- Create: `src/modules/partner/marketplace/list-digest-recipients.logic-function.ts`
- Test: `src/modules/partner/marketplace/list-digest-recipients.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: a workflow step whose output is `{ recipients: [{ email: string, name: string }] }` — Task 3's Iterator consumes `recipients`.

- [ ] **Step 1: Add the identifier constant**

```ts
// in src/constants/universal-identifiers.ts, after ON_OPPORTUNITY_LISTED_FN_UNIVERSAL_IDENTIFIER
export const LIST_DIGEST_RECIPIENTS_FN_UNIVERSAL_IDENTIFIER = '3571d2b3-f90b-48ab-99d8-116d73ddf1d7';
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/modules/partner/marketplace/list-digest-recipients.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import { handler } from './list-digest-recipients.logic-function';

const partnersResult = (nodes: Record<string, unknown>[]) => ({
  partners: { edges: nodes.map((node) => ({ node })) },
});

describe('list-digest-recipients', () => {
  beforeEach(() => queryMock.mockReset());

  it('returns email and name for validated partners with a linked account', async () => {
    queryMock.mockResolvedValue(
      partnersResult([
        { name: 'Meridian Craft', partnerUser: { userEmail: 'meridian@test.dev' } },
        { name: 'No Account Partner', partnerUser: null },
        { name: 'Empty Email', partnerUser: { userEmail: '' } },
      ]),
    );
    const result = await handler({} as never);
    expect(result).toEqual({
      recipients: [{ email: 'meridian@test.dev', name: 'Meridian Craft' }],
    });
  });

  it('dedupes recipients that share one email', async () => {
    queryMock.mockResolvedValue(
      partnersResult([
        { name: 'Parent', partnerUser: { userEmail: 'shared@test.dev' } },
        { name: 'Child', partnerUser: { userEmail: 'shared@test.dev' } },
      ]),
    );
    const result = await handler({} as never);
    expect(result).toEqual({ recipients: [{ email: 'shared@test.dev', name: 'Parent' }] });
  });

  it('returns an empty list when the query returns nothing', async () => {
    queryMock.mockResolvedValue({ partners: { edges: [] } });
    const result = await handler({} as never);
    expect(result).toEqual({ recipients: [] });
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run --project unit src/modules/partner/marketplace/list-digest-recipients.test.ts`
Expected: FAIL — cannot resolve `./list-digest-recipients.logic-function`.

- [ ] **Step 4: Write the query**

```ts
// src/modules/partner/marketplace/graphql/queries/get-digest-recipients.ts
import type { CoreApiClient } from 'twenty-client-sdk/core';

export function getDigestRecipients(client: CoreApiClient) {
  return client.query({
    partners: {
      __args: { filter: { validationStage: { eq: 'VALIDATED' } }, first: 200 },
      edges: {
        node: {
          name: true,
          partnerUser: { userEmail: true },
        },
      },
    },
  });
}
```

- [ ] **Step 5: Write the logic function**

```ts
// src/modules/partner/marketplace/list-digest-recipients.logic-function.ts
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { LIST_DIGEST_RECIPIENTS_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getDigestRecipients } from 'src/modules/partner/marketplace/graphql/queries/get-digest-recipients';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

type DigestRecipient = { email: string; name: string };

// Exists because the workflow Find Records step loads no relations: the Daily Digest
// workflow calls this as a step to resolve partner emails through partnerUser.
export const handler = async (_payload: unknown): Promise<Record<string, unknown>> => {
  const result = await getDigestRecipients(new CoreApiClient());
  const recipients: DigestRecipient[] = [];
  const seen = new Set<string>();
  for (const edge of result.partners?.edges ?? []) {
    const email = edge.node.partnerUser?.userEmail;
    if (!isNonEmptyString(email) || seen.has(email)) continue;
    seen.add(email);
    recipients.push({ email, name: edge.node.name });
  }
  return { recipients };
};

export default defineLogicFunction({
  universalIdentifier: LIST_DIGEST_RECIPIENTS_FN_UNIVERSAL_IDENTIFIER,
  name: 'list-digest-recipients',
  timeoutSeconds: 15,
  handler,
  workflowActionTriggerSettings: {
    label: 'List digest recipients',
    icon: 'IconMail',
  },
});
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run --project unit src/modules/partner/marketplace/list-digest-recipients.test.ts`
Expected: 3 passed. Then `yarn test:unit` — no regressions.

- [ ] **Step 7: Typecheck, commit, apply**

Run: `npx tsc -p tsconfig.json --noEmit` (if TS6305 project-reference noise appears, `npx tsc -p tsconfig.json --noEmit --disableReferencedProjectLoad` must exit 0).

```bash
git add src/constants/universal-identifiers.ts \
        src/modules/partner/marketplace/graphql/queries/get-digest-recipients.ts \
        src/modules/partner/marketplace/list-digest-recipients.logic-function.ts \
        src/modules/partner/marketplace/list-digest-recipients.test.ts
git commit -m "feat(partners): expose digest recipients as a workflow action"
```

Then run `yarn twenty apply` so the step is available in the workflow editor for Task 3's hand-build. If `workflowActionTriggerSettings` is rejected by apply (SDK/server version drift), report BLOCKED with the exact error — do not work around it.
