import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { isCaseStudy } from './content-type';
import { buildReconcilePlan } from './reconcile-children';
import { firstFileUrl } from './profile-picture';
import { buildAppClient, errorResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

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
      published: z.boolean().optional(),
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

// Partner self-controls visibility: published → APPROVED (public), draft → WIP (hidden).
// Ownership (partnerId/partnerUser) and contentType are stamped server-side by the
// on-partner-content-created trigger, never written by the caller — so a partner cannot
// repoint a case study onto another partner's public marketplace profile.
export function buildContentCreateData(
  item: CaseStudyItem,
): CoreSchema.PartnerContentCreateInput {
  return {
    name: item.name,
    clientName: item.clientName,
    headline: item.headline,
    body: { markdown: item.bodyMarkdown ?? '' },
    caseStudyLink: item.caseStudyLink ? { primaryLinkUrl: item.caseStudyLink } : undefined,
    status: item.published ? 'APPROVED' : 'WIP',
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
    status: item.published ? 'APPROVED' : 'WIP',
  };
}

const queryExistingContentIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await client.query({
    partnerContents: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true, contentType: true } },
    },
  });
  return (result.partnerContents?.edges ?? [])
    .filter((edge) => isCaseStudy(edge.node.contentType))
    .map((edge) => edge.node.id);
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
          contentType: true,
        },
      },
    },
  });
  return (result.partnerContents?.edges ?? [])
    .filter((edge) => isCaseStudy(edge.node.contentType))
    .map((edge) => ({
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
    const client = buildAppClient();
    const existingIds = await queryExistingContentIds(client, resolved.partnerId);

    const plan = buildReconcilePlan(existingIds, parsed.data.caseStudies);
    if (!plan) return errorResponse('FORBIDDEN');

    // A just-created row isn't owner-stamped by the trigger yet, so the caller's own re-read
    // (RLS-scoped) can't see it. Return it optimistically from the input + new id.
    const createdRows: CaseStudyRow[] = [];
    for (const item of plan.toCreate) {
      const created = await client.mutation({
        createPartnerContent: {
          __args: { data: buildContentCreateData(item) },
          id: true,
        },
      });
      const newId = created.createPartnerContent?.id;
      if (newId !== undefined) {
        createdRows.push({
          id: newId,
          name: item.name,
          clientName: item.clientName ?? null,
          headline: item.headline ?? null,
          bodyMarkdown: item.bodyMarkdown ?? null,
          coverImageUrl: null,
          caseStudyLink: item.caseStudyLink ?? null,
          status: item.published ? 'APPROVED' : 'WIP',
        });
      }
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

    const existingRows = await queryContentRows(client, resolved.partnerId);
    return { ok: true, caseStudies: [...existingRows, ...createdRows] };
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : String(err));
  }
};

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_CONTENT_ID,
  name: 'save-my-partner-content',
  description:
    "Reconciles the calling partner's own case studies (create/update/delete in one call); each row is published (APPROVED) or kept as a draft (WIP) per its published flag.",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-content',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
