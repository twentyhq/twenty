import { type CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import { buildReconcilePlan } from './reconcile-children';
import { buildAppClient, errorResponse, failureResponse, resolvePartnerFromRequest } from './resolve-partner-from-request';

export const SAVE_MY_PARTNER_SERVICES_ID = '878a6e36-62f4-4590-807d-ef6204d2d168';

export const saveServicesSchema = z.object({
  services: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      description: z.string(),
      sortOrder: z.number().optional(),
    }),
  ),
});

export type SaveServicesInput = z.infer<typeof saveServicesSchema>;

export type ServiceRow = {
  id: string;
  title: string | null;
  description: string | null;
  sortOrder: number | null;
};

export type SaveServicesResult =
  | { ok: true; services: ServiceRow[] }
  | { ok: false; reason: string };

const queryExistingServiceIds = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<string[]> => {
  const result = await client.query({
    partnerServices: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: { node: { id: true } },
    },
  });
  return (result.partnerServices?.edges ?? []).map((edge) => edge.node.id);
};

const queryServiceRows = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<ServiceRow[]> => {
  const result = await client.query({
    partnerServices: {
      __args: { filter: { partnerId: { eq: partnerId } } },
      edges: {
        node: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
        },
      },
    },
  });
  return (result.partnerServices?.edges ?? []).map((edge) => ({
    id: edge.node.id,
    title: edge.node.title ?? null,
    description: edge.node.description ?? null,
    sortOrder: edge.node.sortOrder ?? null,
  }));
};

export const handler = async (event: RoutePayload<unknown>): Promise<SaveServicesResult> => {
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
      await client.mutation({
        createPartnerService: {
          __args: {
            data: {
              partnerId: resolved.partnerId,
              title: service.title,
              description: service.description,
              sortOrder: service.sortOrder,
            },
          },
          id: true,
        },
      });
    }

    for (const service of plan.toUpdate) {
      // buildReconcilePlan only puts items with a defined id into toUpdate.
      if (service.id === undefined) continue;
      await client.mutation({
        updatePartnerService: {
          __args: {
            id: service.id,
            data: {
              title: service.title,
              description: service.description,
              sortOrder: service.sortOrder,
            },
          },
          id: true,
        },
      });
    }

    for (const id of plan.toDelete) {
      await client.mutation({
        deletePartnerService: { __args: { id }, id: true },
      });
    }

    const services = await queryServiceRows(client, resolved.partnerId);
    return { ok: true, services };
  } catch (err) {
    return failureResponse('save-my-partner-services', err);
  }
};

export default defineLogicFunction({
  universalIdentifier: SAVE_MY_PARTNER_SERVICES_ID,
  name: 'save-my-partner-services',
  description:
    "Reconciles the calling partner's own services (create/update/delete in one call).",
  timeoutSeconds: 20,
  handler,
  httpRouteTriggerSettings: {
    path: '/save-my-partner-services',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
