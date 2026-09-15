import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';

const selectNewestCoreWorkflowVersion = <
  TCoreWorkflowVersion extends Pick<CoreWorkflowVersionDTO, 'createdAt'>,
>(
  coreWorkflowVersions: TCoreWorkflowVersion[],
): TCoreWorkflowVersion | undefined =>
  coreWorkflowVersions.reduce<TCoreWorkflowVersion | undefined>(
    (newest, coreWorkflowVersion) =>
      newest === undefined || coreWorkflowVersion.createdAt > newest.createdAt
        ? coreWorkflowVersion
        : newest,
    undefined,
  );

export const selectCurrentCoreWorkflowVersion = <
  TCoreWorkflowVersion extends Pick<
    CoreWorkflowVersionDTO,
    'status' | 'createdAt'
  >,
>(
  coreWorkflowVersions: TCoreWorkflowVersion[],
): TCoreWorkflowVersion | undefined => {
  const newestDraftVersion = selectNewestCoreWorkflowVersion(
    coreWorkflowVersions.filter(
      (coreWorkflowVersion) =>
        coreWorkflowVersion.status === WorkflowVersionStatus.DRAFT,
    ),
  );

  return (
    newestDraftVersion ?? selectNewestCoreWorkflowVersion(coreWorkflowVersions)
  );
};
