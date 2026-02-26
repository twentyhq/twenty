import {
  enumCloudWorkspace2ActivationStatusEnum,
  enumCloudWorkspace2PaymentFrequencyEnum,
  enumCloudWorkspace2SubscriptionStatusEnum,
} from 'twenty-sdk/generated';
import { z } from 'zod';

import { getApplicationConfig } from 'src/shared/application-config';
import { fetchFromClickHouse } from 'src/shared/clickhouse-client';
import { clickHouseDateToIso } from 'src/shared/clickhouse-date-to-iso';
import { twentyClient } from 'src/shared/twenty-client';

const clickHouseWorkspaceSchema = z.object({
  workspaceId: z.string(),
  workspaceName: z.string(),
  subdomain: z.string(),
  customDomain: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string(),
  activationStatus: z
    .string()
    .transform((val) => {
      const upper = val.toUpperCase();
      if (upper === '') return 'EMPTY';
      const valid: string[] = Object.values(
        enumCloudWorkspace2ActivationStatusEnum,
      );
      return valid.includes(upper) ? upper : 'EMPTY';
    })
    .pipe(z.enum(enumCloudWorkspace2ActivationStatusEnum)),
  createdDate: z.string(),
  lastPageviewDate: z.string(),
  pageviewsLast30d: z.coerce.number(),
  pageviewsLast7d: z.coerce.number(),
  pageviewsLast24h: z.coerce.number(),
  totalEverActiveUsers: z.coerce.number(),
  totalWorkspaceUsers: z.coerce.number(),
  activeUsersLast30d: z.coerce.number(),
  activeUsersLast7d: z.coerce.number(),
  activeUsersLast24h: z.coerce.number(),
  isActiveLast30d: z.coerce.boolean(),
  isActiveLast7d: z.coerce.boolean(),
  isActiveLast24h: z.coerce.boolean(),
  activeUserRatioLast30d: z.coerce.number(),
  activeUserRatioLast7d: z.coerce.number(),
  workspaceAgeDays: z.coerce.number(),
  totalEvents: z.coerce.number(),
  eventsLast30d: z.coerce.number(),
  eventsPerUser: z.coerce.number(),
  subscription_status: z
    .string()
    .transform((val) => {
      const upper = val.toUpperCase();
      if (upper === '') return 'EMPTY';
      const valid: string[] = Object.values(
        enumCloudWorkspace2SubscriptionStatusEnum,
      );
      return valid.includes(upper) ? upper : 'OTHER';
    })
    .pipe(z.enum(enumCloudWorkspace2SubscriptionStatusEnum)),
  payment_frequency: z
    .string()
    .transform((val) => {
      const upper = val.toUpperCase();
      if (upper === '') return 'EMPTY';
      const valid: string[] = Object.values(
        enumCloudWorkspace2PaymentFrequencyEnum,
      );
      return valid.includes(upper) ? upper : 'OTHER';
    })
    .pipe(z.enum(enumCloudWorkspace2PaymentFrequencyEnum)),
  trial_status: z.string(),
  mrr: z.coerce.number(),
  potential_arr: z.coerce.number(),
  arr: z.coerce.number().nullable(),
  next_renewal_date: z.string(),
  workspace_domain: z.string(),
  domain_source: z.string(),
  creatorUserId: z.string(),
  creatorEmail: z.string(),
  creator_domain_type: z.string(),
  primary_business_domain: z.string(),
  business_domain_user_count: z.coerce.number(),
  isTwenty: z.coerce.boolean(),
});

type ClickHouseWorkspace = z.infer<typeof clickHouseWorkspaceSchema>;

const fetchWorkspacesFromClickHouse =
  async (): Promise<ClickHouseWorkspace[]> => {
    const { clickHouseDatabase } = getApplicationConfig();

    // const nowDate = 'now()'
    const nowDate = "'2026-02-04 14:28:52.000'";

    const query = `
    SELECT
      *
    FROM (
      SELECT
        *,
        row_number() OVER (PARTITION BY workspaceId ORDER BY updatedAt DESC) AS rn
      FROM
        ${clickHouseDatabase}.workspace
      WHERE
        updatedAt >= ${nowDate} - INTERVAL 500 MINUTE
          AND
        updatedAt <= ${nowDate}
    )
    WHERE
      rn = 1
    FORMAT
      JSONEachRow;
  `;

    return fetchFromClickHouse(query, clickHouseWorkspaceSchema);
  };

// Convert a dollar amount to micros (1 USD = 1_000_000 micros).
const dollarsToAmountMicros = (dollars: number) =>
  Math.round(dollars * 1_000_000);

const buildCloudWorkspaceInput = (workspace: ClickHouseWorkspace) => ({
  id: workspace.workspaceId,
  name: workspace.workspaceName,
  subDomain: workspace.subdomain,
  customDomain: {
    primaryLinkUrl: workspace.customDomain,
    primaryLinkLabel: '',
  },
  activationStatus: workspace.activationStatus,
  subscriptionStatus: workspace.subscription_status,
  paymentFrequency: workspace.payment_frequency,
  lastPageViewDate: workspace.lastPageviewDate,
  pageViewsL30D: workspace.pageviewsLast30d,
  pageViewsL7D: workspace.pageviewsLast7d,
  pageViewsL24H: workspace.pageviewsLast24h,
  totalEverActiveWorkspaceUsers: workspace.totalEverActiveUsers,
  totalWorkspaceUsers: workspace.totalWorkspaceUsers,
  activeUsersL30D: workspace.activeUsersLast30d,
  activeUsersL7D: workspace.activeUsersLast7d,
  activeUsersL24H: workspace.activeUsersLast24h,
  isActiveL30D: workspace.isActiveLast30d,
  isActiveL7D: workspace.isActiveLast7d,
  isActiveL24H: workspace.isActiveLast24h,
  workspaceTenure: workspace.workspaceAgeDays,
  numberOfEventsTotal: workspace.totalEvents,
  numberOfEventsL30D: workspace.eventsLast30d,
  mrr: {
    amountMicros: dollarsToAmountMicros(workspace.mrr),
    currencyCode: 'USD',
  },
  potentialArr: {
    amountMicros: dollarsToAmountMicros(workspace.potential_arr),
    currencyCode: 'USD',
  },
  arr: {
    amountMicros: dollarsToAmountMicros(workspace.arr ?? 0),
    currencyCode: 'USD',
  },
  nextRenewalDate: clickHouseDateToIso(workspace.next_renewal_date),
  creatorEmail: {
    primaryEmail: workspace.creatorEmail,
  },
  workspaceBusinessDomain: {
    primaryLinkUrl: workspace.primary_business_domain,
    primaryLinkLabel: '',
  },
  dataLastUpdatedAt: new Date().toISOString(),
});

export const syncCloudWorkspaces = async (): Promise<{
  syncedCount: number;
}> => {
  const workspaces = await fetchWorkspacesFromClickHouse();

  console.log(`Fetched ${workspaces.length} workspaces from ClickHouse`);

  if (workspaces.length === 0) {
    return { syncedCount: 0 };
  }

  const cloudWorkspaceInputs = workspaces.map(buildCloudWorkspaceInput);

  console.log(
    `Batch-upserting ${cloudWorkspaceInputs.length} cloud workspaces`,
  );

  await twentyClient.mutation({
    createCloudWorkspaces2: {
      __args: {
        data: cloudWorkspaceInputs,
        upsert: true,
      },
      __scalar: true,
    },
  });

  return { syncedCount: workspaces.length };
};
