import {
  buildCountSoql,
  MIGRATION_OBJECT_DEFINITIONS,
} from 'src/logic-functions/migration/migration-object-definitions';
import {
  type MigrationPlan,
  type MigrationPlanObject,
} from 'src/logic-functions/migration/migration-types';
import {
  type SalesforceClient,
  type SalesforceOrgInfo,
} from 'src/logic-functions/salesforce/salesforce-client';
import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';

// Builds the migration plan shown to the user before anything is written:
// which objects, how many records, which fields, and which relations.
export const buildMigrationPlan = async ({
  salesforceClient,
  orgInfo,
  selectedObjectKeys,
}: {
  salesforceClient: SalesforceClient;
  orgInfo: SalesforceOrgInfo;
  selectedObjectKeys?: string[];
}): Promise<MigrationPlan> => {
  const objects: MigrationPlanObject[] = [];
  const warnings: string[] = [];

  const definitions =
    selectedObjectKeys === undefined
      ? MIGRATION_OBJECT_DEFINITIONS
      : MIGRATION_OBJECT_DEFINITIONS.filter((definition) =>
          selectedObjectKeys.includes(definition.key),
        );

  for (const definition of definitions) {
    try {
      const recordCount = await salesforceClient.queryCount(
        buildCountSoql(definition),
      );

      objects.push({
        key: definition.key,
        salesforceObject: definition.salesforceObject,
        targetObject: definition.targetObjectSingular,
        label: definition.itemLabel,
        recordCount,
        fieldMapping: definition.fieldMapping,
        relationNotes: definition.relationNotes,
      });
    } catch (error) {
      warnings.push(
        `${definition.salesforceObject} was excluded: ${getErrorMessage(error)}`,
      );
    }
  }

  return {
    version: 1,
    orgId: orgInfo.orgId,
    orgName: orgInfo.orgName,
    currencyIsoCode: orgInfo.currencyIsoCode,
    apiVersion: salesforceClient.apiVersion,
    objects,
    warnings,
    totalRecords: objects.reduce(
      (total, planObject) => total + planObject.recordCount,
      0,
    ),
    generatedAt: new Date().toISOString(),
  };
};
