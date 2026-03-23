import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-sdk/clients';

import { RECOVER_STUCK_APPLYING_LOGIC_FUNCTION_ID } from 'src/constants/universal-identifiers';

const STUCK_THRESHOLD_MINUTES = 15;

const handler = async () => {
  const client = new CoreApiClient();

  const cutoff = new Date(
    Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000,
  ).toISOString();

  // Find source files stuck in APPLYING for longer than the threshold
  const { payReconSourceFiles: result } = (await client.query({
    payReconSourceFiles: {
      __args: {
        filter: {
          and: [
            { parseStatus: { eq: 'APPLYING' } },
            { updatedAt: { lt: cutoff } },
          ],
        },
        first: 50,
      },
      edges: { node: { id: true, name: true, updatedAt: true } },
    },
  })) as unknown as {
    payReconSourceFiles: {
      edges: { node: { id: string; name: string; updatedAt: string } }[];
    };
  };

  const stuck = result.edges.map((e) => e.node);

  if (stuck.length === 0) {
    return { recovered: 0 };
  }

  console.log(
    `[recover-stuck-applying] Found ${stuck.length} source file(s) stuck in APPLYING`,
  );

  for (const sf of stuck) {
    const stuckMinutes = Math.round(
      (Date.now() - new Date(sf.updatedAt).getTime()) / 60000,
    );

    await client.mutation({
      updatePayReconSourceFile: {
        __args: {
          id: sf.id,
          data: {
            parseStatus: 'FAILED',
            parseError: `Apply timed out after ${stuckMinutes} minutes (auto-recovered)`,
          },
        },
        id: true,
      },
    });

    console.log(
      `[recover-stuck-applying] Marked "${sf.name}" (${sf.id}) as FAILED — stuck for ${stuckMinutes}m`,
    );
  }

  return { recovered: stuck.length };
};

export default defineLogicFunction({
  universalIdentifier: RECOVER_STUCK_APPLYING_LOGIC_FUNCTION_ID,
  name: 'recover-stuck-applying',
  description:
    'Cron job that marks source files stuck in APPLYING for >15 minutes as FAILED',
  timeoutSeconds: 30,
  handler,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
});
