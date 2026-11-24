import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflowVersionMaps } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version-maps.type';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const compareFlatWorkflowVersionsByCreation = (
  firstFlatWorkflowVersion: FlatWorkflowVersion,
  secondFlatWorkflowVersion: FlatWorkflowVersion,
): number => {
  const createdAtDifference =
    Date.parse(firstFlatWorkflowVersion.createdAt) -
    Date.parse(secondFlatWorkflowVersion.createdAt);

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  if (firstFlatWorkflowVersion.id === secondFlatWorkflowVersion.id) {
    return 0;
  }

  return firstFlatWorkflowVersion.id < secondFlatWorkflowVersion.id ? -1 : 1;
};

export const groupFlatWorkflowVersionsByCoreWorkflowId = ({
  flatWorkflowVersionMaps,
  coreWorkflowIds,
}: {
  flatWorkflowVersionMaps: FlatWorkflowVersionMaps;
  coreWorkflowIds?: Set<string>;
}): Map<string, FlatWorkflowVersion[]> => {
  const flatWorkflowVersionsByCoreWorkflowId = new Map<
    string,
    FlatWorkflowVersion[]
  >();

  for (const flatWorkflowVersion of Object.values(
    flatWorkflowVersionMaps.byUniversalIdentifier,
  )) {
    const coreWorkflowId = flatWorkflowVersion?.coreWorkflowId;

    if (
      !isDefined(flatWorkflowVersion) ||
      !isDefined(coreWorkflowId) ||
      (isDefined(coreWorkflowIds) && !coreWorkflowIds.has(coreWorkflowId))
    ) {
      continue;
    }

    const flatWorkflowVersions =
      flatWorkflowVersionsByCoreWorkflowId.get(coreWorkflowId) ?? [];

    flatWorkflowVersions.push(flatWorkflowVersion);
    flatWorkflowVersionsByCoreWorkflowId.set(
      coreWorkflowId,
      flatWorkflowVersions,
    );
  }

  for (const flatWorkflowVersions of flatWorkflowVersionsByCoreWorkflowId.values()) {
    flatWorkflowVersions.sort(compareFlatWorkflowVersionsByCreation);
  }

  return flatWorkflowVersionsByCoreWorkflowId;
};
