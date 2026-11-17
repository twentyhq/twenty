import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkflowMaps } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const resolveCoreWorkflowUniversalIdentifier = ({
  coreWorkflowId,
  flatWorkflowMaps,
}: {
  coreWorkflowId: string | null;
  flatWorkflowMaps: FlatWorkflowMaps;
}): string | null => {
  if (!isDefined(coreWorkflowId)) {
    return null;
  }

  return (
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: coreWorkflowId,
      flatEntityMaps: flatWorkflowMaps,
    })?.universalIdentifier ?? null
  );
};
