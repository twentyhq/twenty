import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';

import { createPartnerLink } from 'src/modules/partner/self-service/graphql/mutations/create-partner-link';
import { deletePartnerLink } from 'src/modules/partner/self-service/graphql/mutations/delete-partner-link';
import { updatePartnerLink } from 'src/modules/partner/self-service/graphql/mutations/update-partner-link';
import { findPartnerLinkIds } from 'src/modules/partner/self-service/graphql/queries/find-partner-link-ids';
import { findPartnerLinkRows } from 'src/modules/partner/self-service/graphql/queries/find-partner-link-rows';
import {
  type LinkRow,
  saveLinksSchema,
} from 'src/modules/partner/self-service/mappers/save-my-partner-links.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';
import { buildReconcilePlan } from 'src/modules/partner/self-service/utils/reconcile-children';

export type SaveLinksResult = { ok: true; links: LinkRow[] } | { ok: false; reason: string };

const queryExistingLinkIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await findPartnerLinkIds(client, partnerId);
  return (result.partnerLinks?.edges ?? []).map((edge) => edge.node.id);
};

const queryLinkRows = async (client: CoreApiClient, partnerId: string): Promise<LinkRow[]> => {
  const result = await findPartnerLinkRows(client, partnerId);
  return (result.partnerLinks?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    name: edge.node.name ?? null,
    url: edge.node.url?.primaryLinkUrl ?? null,
    sortOrder: edge.node.sortOrder ?? null,
  }));
};

export const saveMyPartnerLinks = async (
  event: RoutePayload<unknown>,
): Promise<SaveLinksResult> => {
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
      await createPartnerLink(client, {
        partnerId: resolved.partnerId,
        name: link.name,
        url: { primaryLinkUrl: link.url },
        sortOrder: link.sortOrder,
      });
    }

    for (const link of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (link.id === undefined) continue;
      await updatePartnerLink(client, link.id, {
        name: link.name,
        url: { primaryLinkUrl: link.url },
        sortOrder: link.sortOrder,
      });
    }

    for (const id of plan.toDelete) {
      await deletePartnerLink(client, id);
    }

    const links = await queryLinkRows(client, resolved.partnerId);
    return { ok: true, links };
  } catch (err) {
    return failureResponse('save-my-partner-links', err);
  }
};
