// Remap legacy partnerScope values to the validated categories.
//
//   yarn migrate:partner-scope          # dry-run against .env.local
//   MIGRATE_APPLY=1 yarn migrate:partner-scope
//   yarn migrate:partner-scope:prod     # dry-run against .env.prod
//
// Adding the new options is done in partner.object.ts (additive). This script
// rewrites existing records old→new so the old options can later be removed.
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient } from 'twenty-client-sdk/core';
import { fileURLToPath } from 'url';

import { mapLegacyScope } from './partner-scope-map';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

async function main() {
  const apply = process.env.MIGRATE_APPLY === '1';
  const url = `${requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '')}/graphql`;
  const client = new CoreApiClient({
    url,
    headers: { Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}` },
  });
  console.log(`[migrate-scope] target: ${url} — ${apply ? 'APPLY' : 'dry-run'}`);

  // Pass 1: page through ALL partners read-only and collect those that need remapping.
  type Pending = { id: string; current: string[]; next: string[] };
  const pending: Pending[] = [];
  let after: string | null = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data: any = await client.query({
      partners: {
        __args: after ? { first: 50, after } : { first: 50 },
        edges: { node: { id: true, partnerScope: true }, cursor: true },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as any);
    const edges = data.partners?.edges ?? [];
    for (const edge of edges) {
      const id = edge.node.id as string;
      const current = (edge.node.partnerScope ?? []) as string[];
      const next = mapLegacyScope(current);
      const isChanged =
        next.length !== current.length || next.some((v, i) => v !== current[i]);
      if (!isChanged) continue;
      pending.push({ id, current, next });
      console.log(`[migrate-scope] ${id}: ${JSON.stringify(current)} -> ${JSON.stringify(next)}`);
    }
    if (!data.partners?.pageInfo?.hasNextPage) break;
    after = data.partners.pageInfo.endCursor;
  }

  // Pass 2: apply the remapping mutations (only when MIGRATE_APPLY=1).
  if (apply) {
    for (const { id, next } of pending) {
      await client.mutation({
        updatePartner: { __args: { id, data: { partnerScope: next } }, id: true },
      } as any);
    }
  }

  console.log(`[migrate-scope] ${apply ? 'updated' : 'would update'} ${pending.length} partner(s)`);
  if (!apply) console.log('[migrate-scope] re-run with MIGRATE_APPLY=1 to apply');
}

// Only run when invoked directly (so unit tests can import mapLegacyScope safely).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
