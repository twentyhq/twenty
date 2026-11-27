import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type MarketplaceApplicationRoleSelection = {
  requestedAndAgentFlatRoles: FlatRole[];
  standaloneFlatRoles: FlatRole[];
  ownAgentUniversalIdentifiers: Set<string>;
};

export const selectMarketplaceApplicationRoles = ({
  flatApplication,
  flatRoleMaps,
  flatRoleTargetMaps,
  flatAgentMaps,
}: {
  flatApplication: Pick<
    FlatApplication,
    'universalIdentifier' | 'requestedRoleId'
  >;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleMaps' | 'flatRoleTargetMaps' | 'flatAgentMaps'
>): MarketplaceApplicationRoleSelection => {
  const ownAgentUniversalIdentifiers = new Set(
    Object.values(flatAgentMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatAgent) =>
          flatAgent.applicationUniversalIdentifier ===
          flatApplication.universalIdentifier,
      )
      .map(({ universalIdentifier }) => universalIdentifier),
  );

  const agentRoleUniversalIdentifiers = new Set(
    Object.values(flatRoleTargetMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (flatRoleTarget) =>
          isDefined(flatRoleTarget.agentUniversalIdentifier) &&
          ownAgentUniversalIdentifiers.has(
            flatRoleTarget.agentUniversalIdentifier,
          ),
      )
      .map(({ roleUniversalIdentifier }) => roleUniversalIdentifier),
  );

  const applicationFlatRoles = Object.values(flatRoleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatRole) =>
        flatRole.applicationUniversalIdentifier ===
          flatApplication.universalIdentifier &&
        !flatRole.canBeAssignedToApplications,
    );

  const isRequestedOrAgentRole = (flatRole: FlatRole) =>
    flatRole.id === flatApplication.requestedRoleId ||
    agentRoleUniversalIdentifiers.has(flatRole.universalIdentifier);

  return {
    requestedAndAgentFlatRoles: applicationFlatRoles.filter(
      isRequestedOrAgentRole,
    ),
    standaloneFlatRoles: applicationFlatRoles.filter(
      (flatRole) => !isRequestedOrAgentRole(flatRole),
    ),
    ownAgentUniversalIdentifiers,
  };
};

// Read from role targets, since the 4a sync may already have turned the role flags off
export const findOutsideHolderFlatRoleTargets = ({
  flatRole,
  flatRoleTargetMaps,
  ownAgentUniversalIdentifiers,
}: {
  flatRole: Pick<FlatRole, 'universalIdentifier'>;
  ownAgentUniversalIdentifiers: Set<string>;
} & Pick<AllFlatEntityMaps, 'flatRoleTargetMaps'>): FlatRoleTarget[] =>
  Object.values(flatRoleTargetMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatRoleTarget) =>
        flatRoleTarget.roleUniversalIdentifier ===
          flatRole.universalIdentifier &&
        !isDefined(flatRoleTarget.targetApplicationUniversalIdentifier) &&
        !(
          isDefined(flatRoleTarget.agentUniversalIdentifier) &&
          ownAgentUniversalIdentifiers.has(
            flatRoleTarget.agentUniversalIdentifier,
          )
        ),
    );
