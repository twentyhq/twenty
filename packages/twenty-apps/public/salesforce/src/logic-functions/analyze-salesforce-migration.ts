import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';

import {
  ACTIVE_MIGRATION_STATUSES,
  MIGRATION_ITEM_STATUS,
  MIGRATION_STATUS,
} from 'src/constants/migration-status';
import { ANALYZE_MIGRATION_ROUTE_PATH } from 'src/constants/route-paths';
import { ANALYZE_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildMigrationPlan } from 'src/logic-functions/migration/build-migration-plan';
import {
  getMigrationObjectDefinition,
  isMigrationObjectKey,
} from 'src/logic-functions/migration/migration-object-definitions';
import { type MigrationPlan } from 'src/logic-functions/migration/migration-types';
import { SalesforceClient } from 'src/logic-functions/salesforce/salesforce-client';
import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';

type AnalyzeRequestBody = {
  name?: string;
  objects?: string[];
};

type AnalyzeResponse = {
  success: boolean;
  migrationId?: string;
  plan?: MigrationPlan;
  error?: string;
};

const findActiveMigrationId = async (
  client: CoreApiClient,
): Promise<string | null> => {
  const response = await client.query({
    salesforceMigrations: {
      __args: {
        filter: { status: { in: ACTIVE_MIGRATION_STATUSES } },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return (
    (response as Record<string, any>).salesforceMigrations?.edges?.[0]?.node
      ?.id ?? null
  );
};

const handler = async (
  event: RoutePayload<AnalyzeRequestBody>,
): Promise<AnalyzeResponse> => {
  const body = (event.body ?? {}) as AnalyzeRequestBody;

  try {
    const client = new CoreApiClient();
    const activeMigrationId = await findActiveMigrationId(client);

    if (activeMigrationId !== null) {
      return {
        success: false,
        error:
          'A migration is already running or paused. Finish or cancel it before planning a new one.',
      };
    }

    const selectedObjectKeys = body.objects?.filter(isMigrationObjectKey);
    const salesforceClient = new SalesforceClient();
    const orgInfo = await salesforceClient.getOrgInfo();
    const plan = await buildMigrationPlan({
      salesforceClient,
      orgInfo,
      selectedObjectKeys,
    });

    if (plan.objects.length === 0) {
      return {
        success: false,
        error: `No Salesforce object could be analyzed. ${plan.warnings.join(' ')}`,
      };
    }

    const migrationName =
      body.name?.trim() ||
      `Salesforce migration ${new Date().toISOString().slice(0, 10)} (${orgInfo.orgName})`;

    const createMigrationResponse = await client.mutation({
      createSalesforceMigration: {
        __args: {
          data: {
            name: migrationName,
            status: MIGRATION_STATUS.READY,
            plan,
            totalRecords: plan.totalRecords,
            processedRecords: 0,
            createdRecords: 0,
            updatedRecords: 0,
            failedRecords: 0,
            salesforceOrgId: orgInfo.orgId,
          },
        },
        id: true,
      },
    });

    const migrationId = (createMigrationResponse as Record<string, any>)
      .createSalesforceMigration?.id as string;

    await client.mutation({
      createSalesforceMigrationItems: {
        __args: {
          data: plan.objects.map((planObject) => {
            const definition = getMigrationObjectDefinition(planObject.key);

            return {
              name: planObject.label,
              migrationId,
              status: MIGRATION_ITEM_STATUS.PENDING,
              salesforceObject: planObject.salesforceObject,
              targetObject: planObject.targetObject,
              processingOrder: definition?.processingOrder ?? 99,
              recordCount: planObject.recordCount,
              processedCount: 0,
              createdCount: 0,
              updatedCount: 0,
              failedCount: 0,
              batchRetryCount: 0,
              fieldMapping: planObject.fieldMapping,
            };
          }),
        },
        id: true,
      },
    });

    return { success: true, migrationId, plan };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: ANALYZE_MIGRATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'analyze-salesforce-migration',
  description:
    'Analyzes the Salesforce org and creates a migration plan: objects, record counts, field mappings, and relations. Nothing is written to the CRM until the migration is started.',
  timeoutSeconds: 120,
  handler,
  httpRouteTriggerSettings: {
    path: ANALYZE_MIGRATION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
