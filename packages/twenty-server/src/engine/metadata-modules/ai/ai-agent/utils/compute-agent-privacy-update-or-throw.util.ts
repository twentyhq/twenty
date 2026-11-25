import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';

export const computeAgentPrivacyUpdateOrThrow = ({
  existingFlatAgent,
  isPrivate,
  userWorkspaceId,
}: {
  existingFlatAgent: Pick<
    FlatAgent,
    'id' | 'isPrivate' | 'createdByUserWorkspaceId'
  >;
  isPrivate: boolean | null | undefined;
  userWorkspaceId: string | undefined;
}): Partial<Pick<FlatAgent, 'isPrivate' | 'createdByUserWorkspaceId'>> => {
  if (!isDefined(isPrivate) || isPrivate === existingFlatAgent.isPrivate) {
    return {};
  }

  if (
    !canCallerChangePrivatableEntityPrivacy({
      privatableEntity: existingFlatAgent,
    })
  ) {
    throw new AiException(
      `Agent '${existingFlatAgent.id}' can only have its privacy changed by the member who owns it`,
      AiExceptionCode.AGENT_PRIVACY_CHANGE_NOT_ALLOWED,
      {
        userFriendlyMessage: msg`Only the member who owns an agent can change who sees it.`,
      },
    );
  }

  return {
    isPrivate,
    createdByUserWorkspaceId:
      userWorkspaceId ?? existingFlatAgent.createdByUserWorkspaceId,
  };
};
