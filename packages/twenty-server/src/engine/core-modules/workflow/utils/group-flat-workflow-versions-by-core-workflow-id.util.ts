import { isDefined } from 'twenty-shared/utils';

import { compareFlatWorkflowVersionsByCreation } from 'src/engine/core-modules/workflow/utils/compare-flat-workflow-versions-by-creation.util';
import { type FlatWorkflowVersionMaps } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const groupFlatWorkflowVersionsByCoreWorkflowId = (
  flatWorkflowVersionMaps: FlatWorkflowVersionMaps,
): Map<string, FlatWorkflowVersion[]> => {
  const flatWorkflowVersionsByCoreWorkflowId = new Map<
    string,
    FlatWorkflowVersion[]
  >();

  const flatWorkflowVersionsInCreationOrder = Object.values(
    flatWorkflowVersionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .sort(compareFlatWorkflowVersionsByCreation);

  for (const flatWorkflowVersion of flatWorkflowVersionsInCreationOrder) {
    const { coreWorkflowId } = flatWorkflowVersion;

    if (!isDefined(coreWorkflowId)) {
      continue;
    }

    flatWorkflowVersionsByCoreWorkflowId.set(coreWorkflowId, [
      ...(flatWorkflowVersionsByCoreWorkflowId.get(coreWorkflowId) ?? []),
      flatWorkflowVersion,
    ]);
  }

  return flatWorkflowVersionsByCoreWorkflowId;
};
