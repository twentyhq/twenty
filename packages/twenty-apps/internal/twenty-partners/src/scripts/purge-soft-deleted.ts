// Hard-destroy soft-deleted records that block re-imports.
//
// Twenty SOFT-deletes (sets deletedAt); the row stays in the DB and keeps holding
// unique constraints (e.g. company domain, partner slug). But normal queries —
// including the import's existence checks — exclude soft-deleted rows. So after a
// UI "delete" or a partial import that got rolled back, re-running the import hits
// "A duplicate entry was detected" on records it cannot see. This purges those
// ghosts permanently so idempotent upserts work again.
//
// Only touches soft-deleted rows (deletedAt IS NOT NULL); active/default data is
// left untouched. One bulk destroy per object, so it is not rate-limited.
//
//   yarn purge            # against .env.local
//   yarn purge:prod       # against .env.prod
//
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

// Objects the import writes to. partners + partnerContents are app custom objects;
// companies + opportunities are standard but populated by the import.
const OBJECTS = ['companies', 'partners', 'opportunities', 'partnerContents'] as const;

const gql = async (url: string, key: string, query: string): Promise<any> => {
  const response = await fetch(`${url.replace(/\/$/, '')}/graphql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json: any = await response.json();
  if (json.errors?.length) throw new Error(JSON.stringify(json.errors));
  return json.data;
};

async function main() {
  const url = requireEnv('TWENTY_PARTNERS_API_URL');
  const key = requireEnv('TWENTY_PARTNERS_API_KEY');
  console.log(`[purge] target: ${url} — destroying soft-deleted rows only`);

  for (const obj of OBJECTS) {
    // destroy<Object>s is the bulk variant; capitalise + already-plural names.
    const mutationName = `destroy${obj.charAt(0).toUpperCase()}${obj.slice(1)}`;
    const data = await gql(url, key, `mutation { ${mutationName}(filter: { deletedAt: { is: NOT_NULL } }) { id } }`);
    const destroyed = data[mutationName]?.length ?? 0;
    console.log(`[purge] ${obj}: destroyed ${destroyed} soft-deleted`);
  }

  console.log('[purge] done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
