import { getRoleTargetUniversalIdentifier } from 'twenty-shared/application';

import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';

export const fromAgentManifestToUniversalFlatRoleTarget = ({
  agentUniversalIdentifier,
  roleUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  agentUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatRoleTarget => {
  return {
    universalIdentifier: getRoleTargetUniversalIdentifier({
      applicationUniversalIdentifier,
      agentUniversalIdentifier,
    }),
    applicationUniversalIdentifier,
    roleUniversalIdentifier,
    agentUniversalIdentifier,
    userWorkspaceId: null,
    apiKeyId: null,
    createdAt: now,
    updatedAt: now,
  };
};
