import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const findActiveFlatWorkflowVersionByWorkflowId = (
  flatWorkflowVersionMaps: AllFlatEntityMaps['flatWorkflowVersionMaps'],
): Map<string, FlatWorkflowVersion> =>
  new Map(
    Object.values(flatWorkflowVersionMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (
          flatWorkflowVersion,
        ): flatWorkflowVersion is FlatWorkflowVersion & {
          coreWorkflowId: string;
        } =>
          flatWorkflowVersion.status === WorkflowVersionStatus.ACTIVE &&
          isDefined(flatWorkflowVersion.coreWorkflowId),
      )
      .map((flatWorkflowVersion) => [
        flatWorkflowVersion.coreWorkflowId,
        flatWorkflowVersion,
      ]),
  );
