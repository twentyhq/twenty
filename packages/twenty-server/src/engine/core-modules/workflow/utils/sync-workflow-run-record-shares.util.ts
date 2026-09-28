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

// A run carries its workflow's inputs and outputs, so it is exactly as private
// as its core workflow. Its grants are derived from that workflow rather than
// set by hand, which is why the whole derived set is replaced: a visibility
// change or a new creator must also take away what the old state granted. The
// rule matches buildCoreWorkflowVisibilitySqlPredicate: everyone reads the runs
// of a workspace-visible or ownerless workflow, and the creator always reads
// their own.
export const syncWorkflowRunRecordShares = async ({
  manager,
  workspaceId,
  workflowRunIds = [],
  coreWorkflowIds = [],
}: {
  manager: EntityManager;
  workspaceId: string;
  workflowRunIds?: string[];
  coreWorkflowIds?: string[];
}): Promise<void> => {
  if (workflowRunIds.length === 0 && coreWorkflowIds.length === 0) {
    return;
  }

  const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
  const parameters = [
    workspaceId,
    STANDARD_OBJECTS.workflowRun.universalIdentifier,
    workflowRunIds,
    coreWorkflowIds,
  ];
  const targetRunsCte = `WITH target AS (
      SELECT run.id FROM ${schema}."workflowRun" run
      WHERE run.id = ANY($3::uuid[]) OR run."coreWorkflowId" = ANY($4::uuid[])
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
        AND (
          core_workflow.id = ANY($3::uuid[])
          OR core_workflow.id IN (
            SELECT run."coreWorkflowId" FROM ${schema}."workflowRun" run
            WHERE run.id = ANY($2::uuid[])
          )
        )
      ORDER BY core_workflow.id
      FOR UPDATE`,
      [workspaceId, workflowRunIds, coreWorkflowIds],
    );

    await transactionManager.query(
      `
      ${targetRunsCte}
      DELETE FROM ${schema}."recordShare" share
      USING core."objectMetadata" metadata
      WHERE metadata.id = share."objectMetadataId"
        AND metadata."workspaceId" = $1
        AND metadata."universalIdentifier" = $2
        AND share."recordId" IN (SELECT id FROM target)
        AND (
          -- Grants written on the run's own behalf rather than by a person
          -- sharing it: the ones this sync derives, and the creator role an
          -- application's create writes, which would otherwise keep everyone
          -- holding that role reading a private workflow's runs.
          share."sourceId" = share."recordId"
          OR share."rowCause" = '${RecordShareRowCause.APPLICATION}'
          -- Whatever wrote it, a grant to everyone on a run means
          -- workspace-visible, which only the core workflow decides.
          OR share."principalType" = '${RecordSharePrincipalType.EVERYONE}'
        )`,
      parameters,
    );

    await transactionManager.query(
      `
      ${targetRunsCte}
      INSERT INTO ${schema}."recordShare"
        ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
      SELECT metadata.id, run.id, '${EVERYONE_PRINCIPAL_ID}', '${RecordSharePrincipalType.EVERYONE}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.RULE}', run.id
      FROM ${schema}."workflowRun" run
      JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
      LEFT JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
        AND core_workflow."workspaceId" = $1
      WHERE run.id IN (SELECT id FROM target)
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
      ${targetRunsCte}
      INSERT INTO ${schema}."recordShare"
        ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
      SELECT metadata.id, run.id, member.id, '${RecordSharePrincipalType.WORKSPACE_MEMBER}', '${RecordShareAccessLevel.FULL}', '${RecordShareRowCause.OWNER}', run.id
      FROM ${schema}."workflowRun" run
      JOIN core."objectMetadata" metadata ON metadata."workspaceId" = $1 AND metadata."universalIdentifier" = $2
      JOIN core."workflow" core_workflow ON core_workflow.id = run."coreWorkflowId"
        AND core_workflow."workspaceId" = $1
      JOIN core."userWorkspace" membership ON membership.id = core_workflow."createdByUserWorkspaceId"
        AND membership."workspaceId" = $1 AND membership."deletedAt" IS NULL
      JOIN ${schema}."workspaceMember" member ON member."userId" = membership."userId"
        AND member."deletedAt" IS NULL
      WHERE run.id IN (SELECT id FROM target)
      ON CONFLICT DO NOTHING`,
      parameters,
    );
  };

  if (manager.queryRunner?.isTransactionActive) {
    await sync(manager);

    return;
  }

  await manager.transaction(sync);
};
