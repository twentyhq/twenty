import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { type WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';

export type CoreWorkflowVersionMetadataRow = {
  id: string;
  workflowId: string;
  status: WorkflowVersionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const groupCoreWorkflowVersionsByWorkspaceWorkflowId = ({
  coreWorkflowVersions,
  workspaceVersionIdByCoreVersionId,
}: {
  coreWorkflowVersions: CoreWorkflowVersionMetadataRow[];
  workspaceVersionIdByCoreVersionId: Record<string, string>;
}): Record<string, CoreWorkflowVersionDTO[]> => {
  const coreWorkflowVersionsByWorkspaceWorkflowId: Record<
    string,
    CoreWorkflowVersionMetadataRow[]
  > = {};

  for (const coreWorkflowVersion of coreWorkflowVersions) {
    const workspaceWorkflowVersions =
      coreWorkflowVersionsByWorkspaceWorkflowId[coreWorkflowVersion.workflowId];

    if (isDefined(workspaceWorkflowVersions)) {
      workspaceWorkflowVersions.push(coreWorkflowVersion);
    } else {
      coreWorkflowVersionsByWorkspaceWorkflowId[
        coreWorkflowVersion.workflowId
      ] = [coreWorkflowVersion];
    }
  }

  return Object.fromEntries(
    Object.entries(coreWorkflowVersionsByWorkspaceWorkflowId).map(
      ([workspaceWorkflowId, workspaceWorkflowVersions]) => [
        workspaceWorkflowId,
        workspaceWorkflowVersions
          .map((coreWorkflowVersion, index) => ({
            id: coreWorkflowVersion.id,
            label: buildCoreWorkflowVersionLabel(index + 1),
            status: coreWorkflowVersion.status,
            workspaceWorkflowVersionId:
              workspaceVersionIdByCoreVersionId[coreWorkflowVersion.id] ?? null,
            workspaceWorkflowId,
            trigger: null,
            steps: null,
            createdAt: coreWorkflowVersion.createdAt.toISOString(),
            updatedAt: coreWorkflowVersion.updatedAt.toISOString(),
          }))
          .reverse(),
      ],
    ),
  );
};
