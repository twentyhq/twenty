import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { buildCoreWorkflowVersionLabel } from 'src/engine/core-modules/workflow/utils/build-core-workflow-version-label.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const buildCoreWorkflowVersionSummaries = ({
  flatWorkflowVersionsInCreationOrder,
  workspaceWorkflowId,
}: {
  flatWorkflowVersionsInCreationOrder: FlatWorkflowVersion[];
  workspaceWorkflowId: string | null;
}): CoreWorkflowVersionDTO[] =>
  flatWorkflowVersionsInCreationOrder
    .map((flatWorkflowVersion, index) => ({
      id: flatWorkflowVersion.id,
      coreWorkflowId: flatWorkflowVersion.coreWorkflowId,
      label: buildCoreWorkflowVersionLabel(index + 1),
      status: flatWorkflowVersion.status,
      workspaceWorkflowId,
      trigger: null,
      steps: null,
      createdAt: flatWorkflowVersion.createdAt,
      updatedAt: flatWorkflowVersion.updatedAt,
    }))
    .reverse();
