import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';

import { createPartnerService } from 'src/modules/partner/self-service/graphql/mutations/create-partner-service';
import { deletePartnerService } from 'src/modules/partner/self-service/graphql/mutations/delete-partner-service';
import { updatePartnerService } from 'src/modules/partner/self-service/graphql/mutations/update-partner-service';
import { findPartnerServiceIds } from 'src/modules/partner/self-service/graphql/queries/find-partner-service-ids';
import { findPartnerServiceRows } from 'src/modules/partner/self-service/graphql/queries/find-partner-service-rows';
import {
  saveServicesSchema,
  type ServiceRow,
} from 'src/modules/partner/self-service/mappers/save-my-partner-services.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';
import { buildReconcilePlan } from 'src/modules/partner/self-service/utils/reconcile-children';

export type SaveServicesResult =
  | { ok: true; services: ServiceRow[] }
  | { ok: false; reason: string };

const queryExistingServiceIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await findPartnerServiceIds(client, partnerId);
  return (result.partnerServices?.edges ?? []).map((edge) => edge.node.id);
};

const queryServiceRows = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<ServiceRow[]> => {
  const result = await findPartnerServiceRows(client, partnerId);
  return (result.partnerServices?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    title: edge.node.title ?? null,
    description: edge.node.description ?? null,
    sortOrder: edge.node.sortOrder ?? null,
  }));
};

export const saveMyPartnerServices = async (
  event: RoutePayload<unknown>,
): Promise<SaveServicesResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = saveServicesSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }

  try {
    const client = buildAppClient();
    const existingIds = await queryExistingServiceIds(client, resolved.partnerId);

    const plan = buildReconcilePlan(existingIds, parsed.data.services);
    if (!plan) return errorResponse('FORBIDDEN');

    for (const service of plan.toCreate) {
      await createPartnerService(client, {
        partnerId: resolved.partnerId,
        title: service.title,
        description: service.description,
        sortOrder: service.sortOrder,
      });
    }

    for (const service of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (service.id === undefined) continue;
      await updatePartnerService(client, service.id, {
        title: service.title,
        description: service.description,
        sortOrder: service.sortOrder,
      });
    }

    for (const id of plan.toDelete) {
      await deletePartnerService(client, id);
    }

    const services = await queryServiceRows(client, resolved.partnerId);
    return { ok: true, services };
  } catch (err) {
    return failureResponse('save-my-partner-services', err);
  }
};
