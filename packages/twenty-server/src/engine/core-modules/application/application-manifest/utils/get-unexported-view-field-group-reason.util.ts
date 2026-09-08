import { isDefined } from 'twenty-shared/utils';

import { type ParentViewStatus } from 'src/engine/core-modules/application/application-manifest/types/view-export-classification.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const getUnexportedViewFieldGroupReason = ({
  viewFieldGroupUniversalIdentifier,
  applicationAllFlatEntityMaps,
  parentViewStatusByUniversalIdentifier,
}: {
  viewFieldGroupUniversalIdentifier: string | null;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  parentViewStatusByUniversalIdentifier: ReadonlyMap<string, ParentViewStatus>;
}): string | undefined => {
  if (!isDefined(viewFieldGroupUniversalIdentifier)) {
    return undefined;
  }

  const flatViewFieldGroup =
    applicationAllFlatEntityMaps.flatViewFieldGroupMaps.byUniversalIdentifier[
      viewFieldGroupUniversalIdentifier
    ];

  if (
    !isDefined(flatViewFieldGroup) ||
    flatViewFieldGroup.isSystemSideEffect ||
    parentViewStatusByUniversalIdentifier.get(
      flatViewFieldGroup.viewUniversalIdentifier,
    ) === 'exported'
  ) {
    return undefined;
  }

  return 'view field in a view field group that is not exported';
};
