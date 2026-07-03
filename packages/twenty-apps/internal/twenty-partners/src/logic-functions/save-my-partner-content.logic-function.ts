import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { buildReconcilePlan } from './reconcile-children';
import { firstFileUrl } from './profile-picture';
import { errorResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const SAVE_MY_PARTNER_CONTENT_ID = 'e574fc61-6d9e-48db-9e98-a9b8160188cc';

export const saveContentSchema = z.object({
  caseStudies: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      clientName: z.string().optional(),
      headline: z.string().optional(),
      bodyMarkdown: z.string().optional(),
      caseStudyLink: z.string().optional(),
    }),
  ),
});

export type SaveContentInput = z.infer<typeof saveContentSchema>;

type CaseStudyItem = SaveContentInput['caseStudies'][number];

export type CaseStudyRow = {
  id: string;
  name: string | null;
  clientName: string | null;
  headline: string | null;
  bodyMarkdown: string | null;
  coverImageUrl: string | null;
  caseStudyLink: string | null;
  status: string | null;
};

export type SaveContentResult =
  | { ok: true; caseStudies: CaseStudyRow[] }
  | { ok: false; reason: string };

// Rows author freely: new rows are always created WIP/CASE_STUDY (privileged app
// client bypasses the partner field-locks on status/contentType), and updates never
// touch either column — approval/publication stays staff-controlled.
export function buildContentCreateData(
  item: CaseStudyItem,
  partnerId: string,
): CoreSchema.PartnerContentCreateInput {
  return {
    partnerId,
    name: item.name,
    clientName: item.clientName,
    headline: item.headline,
    body: { markdown: item.bodyMarkdown ?? '' },
    caseStudyLink: item.caseStudyLink ? { primaryLinkUrl: item.caseStudyLink } : undefined,
    contentType: ['CASE_STUDY'],
    status: 'WIP',
  };
}

export function buildContentUpdateData(
  item: CaseStudyItem,
): CoreSchema.PartnerContentUpdateInput {
  return {
    name: item.name,
    clientName: item.clientName,
    headline: item.headline,
    body: { markdown: item.bodyMarkdown ?? '' },
    caseStudyLink: item.caseStudyLink ? { primaryLinkUrl: item.caseStudyLink } : undefined,
  };
}

const queryExistingContentIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await client.query({
    partnerContents: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true } },
    },
  });
  return (result.partnerContents?.edges ?? []).map((edge) => edge.node.id);
};

const queryContentRows = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<CaseStudyRow[]> => {
  const result = await client.query({
    partnerContents: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: {
        node: {
          id: true,
          name: true,
          clientName: true,
          headline: true,
          body: { markdown: true },
          coverImage: { url: true },
          caseStudyLink: { primaryLinkUrl: true },
          status: true,
        },
      },
    },
  });
  return (result.partnerContents?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name ?? null,
    clientName: edge.node.clientName ?? null,
    headline: edge.node.headline ?? null,
    bodyMarkdown: edge.node.body?.markdown ?? null,
    coverImageUrl: firstFileUrl(edge.node.coverImage) ?? null,
    caseStudyLink: edge.node.caseStudyLink?.primaryLinkUrl ?? null,
    status: edge.node.status ?? null,
  }));
};

export const handler = async (event: RoutePayload<unknown>): Promise<SaveContentResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = saveContentSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }

  try {
    const client = new CoreApiClient();
    const existingIds = await queryExistingContentIds(client, resolved.partnerId);

    const plan = buildReconcilePlan(existingIds, parsed.data.caseStudies);
    if (!plan) return errorResponse('FORBIDDEN');

    for (const item of plan.toCreate) {
      await client.mutation({
        createPartnerContent: {
          __args: { data: buildContentCreateData(item, resolved.partnerId) },
          id: true,
        },
      });
    }

    for (const item of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (item.id === undefined) continue;
      await client.mutation({
        updatePartnerContent: {
          __args: { id: item.id, data: buildContentUpdateData(item) },
          id: true,
        },
      });
    }

    for (const id of plan.toDelete) {
      await client.mutation({
        deletePartnerContent: { __args: { id }, id: true },
      });
    }

    const caseStudies = await queryContentRows(client, resolved.partnerId);
    return { ok: true, caseStudies };
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : String(err));
  }
};

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_CONTENT_ID,
  name: 'save-my-partner-content',
  description:
    "Reconciles the calling partner's own case studies (create/update/delete in one call); new rows are always WIP.",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-content',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
