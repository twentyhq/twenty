// Stamps partnerUser on every child record whose partner is already linked to a member.
// Required after the Application RLS predicate narrowed to `partnerUser IS the current
// member`: a row without partnerUser is invisible to its own partner.
//
//   yarn backfill:partner-user        # against .env.local
//   yarn backfill:partner-user:prod   # against .env.prod
//
import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient } from 'twenty-client-sdk/core';

import { backfillPartnerUserOnChildren } from './backfill-partner-user-on-children';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

async function main() {
  const client = new CoreApiClient({
    url: `${requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '')}/graphql`,
    headers: { Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}` },
  });

  const stamped = await backfillPartnerUserOnChildren(client);

  console.log(`[backfill:partner-user] stamped ${stamped} record(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
