import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const findApplicationGrantFlatRoleTarget = ({
  flatRoleTargetMaps,
  applicationUniversalIdentifier,
}: {
  flatRoleTargetMaps: FlatRoleTargetMaps;
  applicationUniversalIdentifier: string;
}): FlatRoleTarget | undefined =>
  Object.values(flatRoleTargetMaps.byUniversalIdentifier).find(
    (flatRoleTarget) =>
      isDefined(flatRoleTarget) &&
      flatRoleTarget.targetApplicationUniversalIdentifier ===
        applicationUniversalIdentifier,
  );
