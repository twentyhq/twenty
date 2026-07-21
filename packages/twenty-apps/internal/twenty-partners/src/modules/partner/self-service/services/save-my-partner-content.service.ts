import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';

import { createPartnerContent } from 'src/modules/partner/self-service/graphql/mutations/create-partner-content';
import { deletePartnerContent } from 'src/modules/partner/self-service/graphql/mutations/delete-partner-content';
import { updatePartnerContent } from 'src/modules/partner/self-service/graphql/mutations/update-partner-content';
import { findPartnerContentIds } from 'src/modules/partner/self-service/graphql/queries/find-partner-content-ids';
import { findPartnerContentRows } from 'src/modules/partner/self-service/graphql/queries/find-partner-content-rows';
import {
  buildContentCreateData,
  buildContentUpdateData,
  type CaseStudyRow,
  saveContentSchema,
} from 'src/modules/partner/self-service/mappers/save-my-partner-content.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';
import { isCaseStudy } from 'src/modules/partner/self-service/utils/content-type';
import { buildReconcilePlan } from 'src/modules/partner/self-service/utils/reconcile-children';

export type SaveContentResult =
  | { ok: true; caseStudies: CaseStudyRow[] }
  | { ok: false; reason: string };

const queryExistingContentIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await findPartnerContentIds(client, partnerId);
  return (result.partnerContents?.edges ?? [])
    .filter((edge) => isCaseStudy(edge.node.contentType))
    .map((edge) => edge.node.id);
};

const queryContentRows = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<CaseStudyRow[]> => {
  const result = await findPartnerContentRows(client, partnerId);
  return (result.partnerContents?.edges ?? [])
    .filter((edge) => isCaseStudy(edge.node.contentType))
    .map((edge) => ({
      id: edge.node.id,
      name: edge.node.name ?? null,
      clientName: edge.node.clientName ?? null,
      headline: edge.node.headline ?? null,
      bodyMarkdown: edge.node.body?.markdown ?? null,
      coverImageUrl: edge.node.coverImageUrl || null,
      caseStudyLink: edge.node.caseStudyLink?.primaryLinkUrl ?? null,
      status: edge.node.status ?? null,
    }));
};

export const saveMyPartnerContent = async (
  event: RoutePayload<unknown>,
): Promise<SaveContentResult> => {
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
      const created = await createPartnerContent(client, buildContentCreateData(item));
      const newId = created.createPartnerContent?.id;
      if (newId !== undefined) {
        createdRows.push({
          id: newId,
          name: item.name,
          clientName: item.clientName ?? null,
          headline: item.headline ?? null,
          bodyMarkdown: item.bodyMarkdown ?? null,
          coverImageUrl: item.coverImageUrl ?? null,
          caseStudyLink: item.caseStudyLink ?? null,
          status: item.published ? 'APPROVED' : 'WIP',
        });
      }
    }

    for (const item of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (item.id === undefined) continue;
      await updatePartnerContent(client, item.id, buildContentUpdateData(item));
    }

    for (const id of plan.toDelete) {
      await deletePartnerContent(client, id);
    }

    // A just-created row can surface in the re-read too once the trigger stamps its
    // partnerId, so drop those ids before appending the optimistic createdRows.
    const existingRows = await queryContentRows(client, resolved.partnerId);
    const createdIds = new Set(createdRows.map((row) => row.id));
    const deduped = existingRows.filter((row) => !createdIds.has(row.id));
    return { ok: true, caseStudies: [...deduped, ...createdRows] };
  } catch (err) {
    return failureResponse('save-my-partner-content', err);
  }
};
