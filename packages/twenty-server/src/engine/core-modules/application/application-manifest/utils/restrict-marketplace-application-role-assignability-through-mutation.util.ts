import {
  type ApplicationManifestRoleSources,
  classifyApplicationManifestRoles,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

// Both flags default to true when omitted, and rejecting them would break published versions
export const restrictMarketplaceApplicationRoleAssignabilityThroughMutation = <
  TFlatRole extends Pick<
    UniversalFlatRole,
    'canBeAssignedToUsers' | 'canBeAssignedToApiKeys'
  >,
>({
  manifest,
  toAllUniversalFlatEntityMapsToMutate: { flatRoleMaps },
}: {
  manifest: ApplicationManifestRoleSources;
  toAllUniversalFlatEntityMapsToMutate: {
    flatRoleMaps: { byUniversalIdentifier: Partial<Record<string, TFlatRole>> };
  };
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
