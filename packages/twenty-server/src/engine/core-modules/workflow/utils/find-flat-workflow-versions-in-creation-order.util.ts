import { isDefined } from 'twenty-shared/utils';

import { compareFlatWorkflowVersionsByCreation } from 'src/engine/core-modules/workflow/utils/compare-flat-workflow-versions-by-creation.util';
import { type FlatWorkflowVersionMaps } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const findFlatWorkflowVersionsInCreationOrder = ({
  flatWorkflowVersionMaps,
  coreWorkflowId,
}: {
  flatWorkflowVersionMaps: FlatWorkflowVersionMaps;
  coreWorkflowId: string;
}): FlatWorkflowVersion[] =>
  Object.values(flatWorkflowVersionMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatWorkflowVersion) =>
        flatWorkflowVersion.coreWorkflowId === coreWorkflowId,
    )
    .sort(compareFlatWorkflowVersionsByCreation);
