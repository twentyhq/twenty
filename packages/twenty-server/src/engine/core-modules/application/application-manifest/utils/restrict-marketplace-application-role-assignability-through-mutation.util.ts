import {
  classifyApplicationManifestRoles,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

// Both flags default to true when omitted, and rejecting them would break published versions
export const restrictMarketplaceApplicationRoleAssignabilityThroughMutation = ({
  manifest,
  toAllUniversalFlatEntityMapsToMutate: { flatRoleMaps },
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
  toAllUniversalFlatEntityMapsToMutate: Pick<
    AllUniversalFlatEntityMaps,
    'flatRoleMaps'
  >;
}): void => {
  const { roleKindsByUniversalIdentifier } = classifyApplicationManifestRoles({
    manifest,
  });

  for (const roleUniversalIdentifier of roleKindsByUniversalIdentifier.keys()) {
    const universalFlatRole =
      flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier];

    if (isDefined(universalFlatRole)) {
      flatRoleMaps.byUniversalIdentifier[roleUniversalIdentifier] = {
        ...universalFlatRole,
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
      };
    }
  }
};
