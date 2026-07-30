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

import { backfillPartnerUserOnChildren } from 'src/scripts/backfill-partner-user-on-children';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

async function main() {
  const apiUrl = requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '');
  console.log(`[backfill:partner-user] target: ${apiUrl}`);

  const client = new CoreApiClient({
    url: `${apiUrl}/graphql`,
    headers: { Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}` },
  });

  const stamped = await backfillPartnerUserOnChildren(client);
  console.log(`[backfill:partner-user] stamped ${stamped} record(s)`);

  // Rows with no partner are unreachable from a partner-rooted walk. Report them: this
  // count is the operator's only signal that the runbook step actually finished the job.
  const orphans = await client.query({
    applications: {
      __args: { filter: { partnerUserId: { is: 'NULL' } }, first: 1 },
      totalCount: true,
    },
  });
  const remaining = orphans.applications?.totalCount ?? 0;
  console.log(
    remaining === 0
      ? '[backfill:partner-user] no application left without a partnerUser'
      : `[backfill:partner-user] ⚠ ${remaining} application(s) still have no partnerUser ` +
          '(no partner set, or their partner has no linked member) — invisible to partners',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
