import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_BRIEF_REVIEW_LINK_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Builds the client-facing magic-link once per Brief and stores it on the
// record, so ops can copy (or click) it straight from the side panel.
//
// reviewToken is populated by its `uuid` default at insert, so it is already in
// the DB when brief.created fires; we read it back by id rather than trust the
// event payload (the table "New Brief" flow emits an almost-empty `after`).
// Idempotent: once reviewLink is set, we never overwrite it.
const setBriefReviewLink = async (briefId: string): Promise<boolean> => {
  const client = new CoreApiClient();

  const res = await client.query({
    brief: {
      __args: { filter: { id: { eq: briefId } } },
      reviewToken: true,
      reviewLink: { primaryLinkUrl: true },
    },
  });

  const token = res.brief?.reviewToken;
  if (!token || res.brief?.reviewLink?.primaryLinkUrl) return false;

  // Prod sets REVIEW_PAGE_BASE_URL as a workspace app variable; locally the dev
  // server is the zero-config default. `||` (not `??`) because an unset variable
  // arrives as "". Never persist a localhost link in production: if it's
  // unconfigured there, skip rather than store an unusable link.
  const configured = process.env.REVIEW_PAGE_BASE_URL?.replace(/\/+$/, '');
  if (!configured && process.env.NODE_ENV === 'production') return false;
  const base = configured || 'http://localhost:3003';

  await client.mutation({
    updateBrief: {
      __args: {
        id: briefId,
        data: {
          reviewLink: {
            primaryLinkUrl: `${base}/partners/review/${token}`,
            primaryLinkLabel: 'Open review',
          },
        },
      },
      id: true,
    },
  });

  return true;
};

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Brief>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  try {
    return { reviewLinkSet: await setBriefReviewLink(after.id) };
  } catch (e) {
    console.error('on-brief-created-set-review-link failed', e);
    return { reviewLinkSet: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_BRIEF_REVIEW_LINK_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-brief-created-set-review-link',
  description:
    'Stores the client review magic-link on a Brief when it is created.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'brief.created',
  },
});
