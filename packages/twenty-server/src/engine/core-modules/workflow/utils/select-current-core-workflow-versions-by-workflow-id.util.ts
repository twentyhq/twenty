import { isDefined } from 'twenty-shared/utils';

import { type CoreWorkflowVersionDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-version.dto';
import { selectCurrentCoreWorkflowVersion } from 'src/engine/core-modules/workflow/utils/select-current-core-workflow-version.util';

type SelectableCoreWorkflowVersion = Pick<
  CoreWorkflowVersionDTO,
  'status' | 'createdAt'
> & { workflowId: string };

export const selectCurrentCoreWorkflowVersionsByWorkflowId = <
  TCoreWorkflowVersion extends SelectableCoreWorkflowVersion,
>(
  coreWorkflowVersionsSortedFromOldest: TCoreWorkflowVersion[],
): Record<
  string,
  { currentVersion: TCoreWorkflowVersion; positionFromOldest: number }
> => {
  const coreWorkflowVersionsByWorkflowId: Record<
    string,
    TCoreWorkflowVersion[]
  > = {};

  for (const coreWorkflowVersion of coreWorkflowVersionsSortedFromOldest) {
    const workflowVersions =
      coreWorkflowVersionsByWorkflowId[coreWorkflowVersion.workflowId];

    if (isDefined(workflowVersions)) {
      workflowVersions.push(coreWorkflowVersion);
    } else {
      coreWorkflowVersionsByWorkflowId[coreWorkflowVersion.workflowId] = [
        coreWorkflowVersion,
      ];
    }
  }

  return Object.fromEntries(
    Object.entries(coreWorkflowVersionsByWorkflowId).flatMap(
      ([workflowId, workflowVersions]) => {
        const currentVersion =
          selectCurrentCoreWorkflowVersion(workflowVersions);

        if (!isDefined(currentVersion)) {
          return [];
        }

        return [
          [
            workflowId,
            {
              currentVersion,
              positionFromOldest: workflowVersions.indexOf(currentVersion) + 1,
            },
          ],
        ];
      },
    ),
  );
};
