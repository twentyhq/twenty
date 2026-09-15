import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';

export const selectCurrentCoreWorkflowVersion = <
  TCoreWorkflowVersion extends Pick<
    CoreWorkflowVersionDTO,
    'status' | 'createdAt'
  >,
>(
  coreWorkflowVersions: TCoreWorkflowVersion[],
): TCoreWorkflowVersion | undefined => {
  const draftVersion = coreWorkflowVersions.find(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === WorkflowVersionStatus.DRAFT,
  );

  const newestVersion = coreWorkflowVersions.reduce<
    TCoreWorkflowVersion | undefined
  >(
    (newest, coreWorkflowVersion) =>
      newest === undefined || coreWorkflowVersion.createdAt > newest.createdAt
        ? coreWorkflowVersion
        : newest,
    undefined,
  );

  return draftVersion ?? newestVersion;
};
