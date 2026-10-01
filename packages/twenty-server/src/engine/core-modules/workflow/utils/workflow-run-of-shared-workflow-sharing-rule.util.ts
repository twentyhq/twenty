import { isNonEmptyString } from '@sniptt/guards';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  WorkflowVisibility,
} from 'twenty-shared/types';

import { type RecordSharingRule } from 'src/engine/core-modules/record-share/types/record-sharing-rule.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const buildPrivateCoreWorkflowCondition = (coreWorkflowAlias: string) =>
  `${coreWorkflowAlias}."visibility" <> '${WorkflowVisibility.WORKSPACE}' AND ${coreWorkflowAlias}."createdByUserWorkspaceId" IS NOT NULL`;

// Runs carry their workflow's data, so they are visible to everyone unless
// their core workflow is private to its creator; a missing workflow hides nothing
export const WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE: RecordSharingRule = {
  objectUniversalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
  principalId: EVERYONE_PRINCIPAL_ID,
  accessLevel: RecordShareAccessLevel.FULL,
  buildCondition: ({ tableAlias, workspaceId }) => {
    const coreWorkflowAlias = escapeIdentifier(`${tableAlias}_coreWorkflow`);

    return {
      sql: `NOT EXISTS (SELECT 1 FROM core."workflow" AS ${coreWorkflowAlias} WHERE ${coreWorkflowAlias}."id" = ${escapeIdentifier(tableAlias)}."coreWorkflowId" AND ${coreWorkflowAlias}."workspaceId" = :sharingRuleWorkspaceId AND ${buildPrivateCoreWorkflowCondition(coreWorkflowAlias)})`,
      parameters: { sharingRuleWorkspaceId: workspaceId },
    };
  },
  resolveMatchingRecordIds: async ({
    records,
    workspaceId,
    executeRawQuery,
  }) => {
    const coreWorkflowIds = [
      ...new Set(
        records.map((record) => record.coreWorkflowId).filter(isNonEmptyString),
      ),
    ];
    const privateCoreWorkflowIds =
      coreWorkflowIds.length === 0
        ? new Set<string>()
        : new Set(
            (
              await executeRawQuery(
                `SELECT "id" FROM core."workflow" AS "coreWorkflow" WHERE "coreWorkflow"."id" = ANY(:coreWorkflowIds) AND "coreWorkflow"."workspaceId" = :workspaceId AND ${buildPrivateCoreWorkflowCondition('"coreWorkflow"')}`,
                { coreWorkflowIds, workspaceId },
              )
            ).map((row) => String(row.id)),
          );

    return new Set(
      records
        .filter(
          (record) =>
            !isNonEmptyString(record.coreWorkflowId) ||
            !privateCoreWorkflowIds.has(record.coreWorkflowId),
        )
        .map((record) => record.id),
    );
  },
};
