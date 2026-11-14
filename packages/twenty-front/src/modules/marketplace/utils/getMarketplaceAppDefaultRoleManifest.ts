import { buildRoleManifestFromMarketplaceAppRole } from '@/marketplace/utils/buildRoleManifestFromMarketplaceAppRole';
import { type LegacyCompliantRoleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type MarketplaceAppDetail } from '~/generated-metadata/graphql';

export const getMarketplaceAppDefaultRoleManifest = (
  detail:
    | Pick<MarketplaceAppDetail, 'roles' | 'defaultRoleUniversalIdentifier'>
    | null
    | undefined,
): LegacyCompliantRoleManifest | undefined => {
  const defaultRole = detail?.roles?.find(
    (role) =>
      role.universalIdentifier === detail?.defaultRoleUniversalIdentifier,
  );

  return isDefined(defaultRole)
    ? buildRoleManifestFromMarketplaceAppRole(defaultRole)
    : undefined;
};
