import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  WorkflowVisibility,
} from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A workflow's runs and versions inherit their readability from its workspace
// record, so that record's grants are the one place a workflow's visibility is
// enforced. They are derived from the core workflow rather than set by hand,
// which is why the whole derived set is replaced: a visibility change or a new
// creator must also take away what the old state granted. The rule matches
// buildCoreWorkflowVisibilitySqlPredicate: everyone reads a workspace-visible
// or ownerless workflow, and the creator always reads their own.
export const syncWorkflowRecordShares = async ({
  manager,
  workspaceId,
  workspaceWorkflowIds = [],
  coreWorkflowIds = [],
}: {
  manager: EntityManager;
  workspaceId: string;
  workspaceWorkflowIds?: string[];
  // Resolved to their workspace records here because a core workflow's own
  // pointer to that record is not written on every path.
  coreWorkflowIds?: string[];
}): Promise<void> => {
  if (workspaceWorkflowIds.length === 0 && coreWorkflowIds.length === 0) {
    return;
  }

  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const parameters = [
    workspaceId,
    STANDARD_OBJECTS.workflow.universalIdentifier,
    workspaceWorkflowIds,
    coreWorkflowIds,
  ];
  const targetWorkflowsCte = `WITH target AS (
      SELECT workflow.id FROM ${schema}."workflow" workflow
      WHERE workflow.id = ANY($3::uuid[]) OR workflow."coreWorkflowId" = ANY($4::uuid[])
    )`;

  const sync = async (transactionManager: EntityManager) => {
    // Without this lock, a sync reading a workflow as workspace-visible just
    // before a concurrent switch to private commits would put back the grant
    // that switch removed. The switch updates the same core row, so the two
    // are serialised and every statement below reads the committed state.
    await transactionManager.query(
      `
      SELECT core_workflow.id FROM core."workflow" core_workflow
      WHERE core_workflow."workspaceId" = $1
        AND core_workflow.id IN (
          SELECT workflow."coreWorkflowId" FROM ${schema}."workflow" workflow
          WHERE workflow.id = ANY($2::uuid[]) OR workflow."coreWorkflowId" = ANY($3::uuid[])
        )
      ORDER BY core_workflow.id
      FOR UPDATE`,
      [workspaceId, workspaceWorkflowIds, coreWorkflowIds],
    );

    await transactionManager.query(
      `
      ${targetWorkflowsCte}
      DELETE FROM ${schema}."recordShare" share
      USING core."objectMetadata" metadata
      WHERE metadata.id = share."objectMetadataId"
        AND metadata."workspaceId" = $1
        AND metadata."universalIdentifier" = $2
        AND share."recordId" IN (SELECT id FROM target)
        AND (
          (
            share."sourceId" = share."recordId"
            AND share."rowCause" IN ('${RecordShareRowCause.OWNER}', '${RecordShareRowCause.RULE}')
          )
          -- Whatever wrote it, a grant to everyone on a workflow means
          -- workspace-visible, which only the core workflow decides.
          OR share."principalType" = '${RecordSharePrincipalType.EVERYONE}'
        )`,
      parameters,
    );

    await transactionManager.query(
      `
      ${targetWorkflowsCte}
      INSERT INTO ${schema}."recordShare"
        ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
      SELECT metadata.id, workflow.id, '${EVERYONE_PRINCIPAL_ID}', '${RecordSharePrincipalType.EVERYONE}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.RULE}', workflow.id
      FROM ${schema}."workflow" workflow
      JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
      LEFT JOIN core."workflow" core_workflow ON core_workflow.id = workflow."coreWorkflowId"
        AND core_workflow."workspaceId" = $1
      WHERE workflow.id IN (SELECT id FROM target)
        AND (
          core_workflow.id IS NULL
          OR core_workflow."visibility" = '${WorkflowVisibility.WORKSPACE}'
          OR core_workflow."createdByUserWorkspaceId" IS NULL
        )
      ON CONFLICT DO NOTHING`,
      parameters,
    );

    await transactionManager.query(
      `
      ${targetWorkflowsCte}
      INSERT INTO ${schema}."recordShare"
        ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
      SELECT metadata.id, workflow.id, member.id, '${RecordSharePrincipalType.WORKSPACE_MEMBER}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.OWNER}', workflow.id
      FROM ${schema}."workflow" workflow
      JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
      JOIN core."workflow" core_workflow ON core_workflow.id = workflow."coreWorkflowId"
        AND core_workflow."workspaceId" = $1
      JOIN core."userWorkspace" membership ON membership.id = core_workflow."createdByUserWorkspaceId"
        AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
      JOIN ${schema}."workspaceMember" member ON member."userId" = membership."userId"
        AND member."deletedAt" IS NULL
      WHERE workflow.id IN (SELECT id FROM target)
      ON CONFLICT DO NOTHING`,
      parameters,
    );
  };

  if (manager.queryRunner?.isTransactionActive === true) {
    await sync(manager);

    return;
  }

  await manager.transaction(sync);
};
