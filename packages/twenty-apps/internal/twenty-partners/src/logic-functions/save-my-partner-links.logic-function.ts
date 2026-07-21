import { type CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { isHttpUrl } from './http-url';
import { buildReconcilePlan } from './reconcile-children';
import { buildAppClient, errorResponse, failureResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const SAVE_MY_PARTNER_LINKS_ID = 'b56d1158-4e79-4fdb-a7c4-e0f8871b2d42';

export const saveLinksSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      url: z.string().refine((value) => value === '' || isHttpUrl(value), {
        message: 'URL must use http or https',
      }),
      sortOrder: z.number().optional(),
    }),
  ),
});

export type SaveLinksInput = z.infer<typeof saveLinksSchema>;

export type LinkRow = {
  id: string;
  name: string | null;
  url: string | null;
  sortOrder: number | null;
};

export type SaveLinksResult = { ok: true; links: LinkRow[] } | { ok: false; reason: string };

const queryExistingLinkIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await client.query({
    partnerLinks: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true } },
    },
  });
  return (result.partnerLinks?.edges ?? []).map((edge) => edge.node.id);
};

const queryLinkRows = async (client: CoreApiClient, partnerId: string): Promise<LinkRow[]> => {
  const result = await client.query({
    partnerLinks: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: {
        node: {
          id: true,
          name: true,
          url: { primaryLinkUrl: true },
          sortOrder: true,
        },
      },
    },
  });
  return (result.partnerLinks?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name ?? null,
    url: edge.node.url?.primaryLinkUrl ?? null,
    sortOrder: edge.node.sortOrder ?? null,
  }));
};

export const handler = async (event: RoutePayload<unknown>): Promise<SaveLinksResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = saveLinksSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }

  try {
    const client = buildAppClient();
    const existingIds = await queryExistingLinkIds(client, resolved.partnerId);

    const plan = buildReconcilePlan(existingIds, parsed.data.links);
    if (!plan) return errorResponse('FORBIDDEN');

    for (const link of plan.toCreate) {
      await client.mutation({
        createPartnerLink: {
          __args: {
            data: {
              partnerId: resolved.partnerId,
              name: link.name,
              url: { primaryLinkUrl: link.url },
              sortOrder: link.sortOrder,
            },
          },
          id: true,
        },
      });
    }

    for (const link of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (link.id === undefined) continue;
      await client.mutation({
        updatePartnerLink: {
          __args: {
            id: link.id,
            data: {
              name: link.name,
              url: { primaryLinkUrl: link.url },
              sortOrder: link.sortOrder,
            },
          },
          id: true,
        },
      });
    }

    for (const id of plan.toDelete) {
      await client.mutation({
        deletePartnerLink: { __args: { id }, id: true },
      });
    }

    const links = await queryLinkRows(client, resolved.partnerId);
    return { ok: true, links };
  } catch (err) {
    return failureResponse('save-my-partner-links', err);
  }
};

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_LINKS_ID,
  name: 'save-my-partner-links',
  description: "Reconciles the calling partner's own links (create/update/delete in one call).",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-links',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
