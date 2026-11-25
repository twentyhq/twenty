import { isDefined } from 'twenty-shared/utils';

import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const computeAgentPrivacyUpdate = ({
  existingFlatAgent,
  isPrivate,
  userWorkspaceId,
}: {
  existingFlatAgent: Pick<FlatAgent, 'isPrivate' | 'createdByUserWorkspaceId'>;
  isPrivate: boolean | null | undefined;
  userWorkspaceId: string | undefined;
}): Partial<Pick<FlatAgent, 'isPrivate' | 'createdByUserWorkspaceId'>> => {
  if (!isDefined(isPrivate) || isPrivate === existingFlatAgent.isPrivate) {
    return {};
  }

  return {
    isPrivate,
    createdByUserWorkspaceId:
      userWorkspaceId ?? existingFlatAgent.createdByUserWorkspaceId,
  };
};
