import { type DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Fires when an opportunity's matchStatus is set to 'AUTO_MATCH'.
// Happy path: picks the longest-idle ACTIVE+AVAILABLE partner, assigns it, flips to 'MATCHED'.
// Failure path: no partner available → flips to 'MANUAL_MATCH' and creates an audit Note.
const handler = async (payload: DatabaseEventPayload) => {
  const props = payload.properties as {
    after?: { id: string; matchStatus?: string; partnerId?: string | null };
    before?: { matchStatus?: string };
    updatedFields?: string[];
  };

  if (!props.updatedFields?.includes('matchStatus')) return {};
  if (props.after?.matchStatus !== 'AUTO_MATCH') return {};
  if (props.before?.matchStatus === 'AUTO_MATCH') return {};
  if (props.after.partnerId) return {};

  const client = new CoreApiClient();

  const partnersResult = await client.query({
    partners: {
      __args: {
        filter: {
          validationStage: { eq: 'VALIDATED' },
          availability: { eq: 'AVAILABLE' },
        },
        orderBy: [{ lastMatchAt: 'AscNullsFirst' }],
        first: 1,
      },
      edges: { node: { id: true, lastMatchAt: true } },
    },
  } as any);

  const topPartner = (partnersResult.partners as any).edges[0]?.node;
  if (!topPartner) {
    const noteBody =
      `Auto-match attempted ${new Date().toISOString()}.\n` +
      `No partners matched (status=ACTIVE, availability=AVAILABLE).\n` +
      `Status moved to Manual Match — pick a partner manually or ` +
      `update partner availability and retry by setting status back to Auto Match.`;

    try {
      const noteResult = await client.mutation({
        createNote: {
          __args: { data: { title: 'Auto-match failed', bodyV2: { markdown: noteBody } } },
          id: true,
        },
      } as any);
      const noteId = (noteResult as any).createNote.id as string;

      await client.mutation({
        createNoteTarget: {
          __args: { data: { noteId, targetOpportunityId: props.after.id } },
          id: true,
        },
      } as any);
    } catch {
      // Note creation is best-effort; status flip is the critical action.
    }

    await client.mutation({
      updateOpportunity: {
        __args: { id: props.after.id, data: { matchStatus: 'MANUAL_MATCH' } },
        id: true,
      },
    } as any);

    return { matched: false, reason: 'no_partner_available' };
  }

  await client.mutation({
    updateOpportunity: {
      __args: {
        id: props.after.id,
        data: { partnerId: topPartner.id, matchStatus: 'MATCHED' },
      },
      id: true,
    },
  } as any);

  await client.mutation({
    updatePartner: {
      __args: {
        id: topPartner.id,
        data: { lastMatchAt: new Date().toISOString() },
      },
      id: true,
    },
  } as any);

  return { matched: true, partnerId: topPartner.id };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-auto-match',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
  },
});
