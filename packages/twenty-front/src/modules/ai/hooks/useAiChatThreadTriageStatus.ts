import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const TRIAGE_STATUS_BY_SCOPE = {
  INBOX: 'open',
  SNOOZED: 'snoozed',
  ARCHIVED: 'done',
} as const;

export const useAiChatThreadTriageStatus = (threadId: string) => {
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const { scope } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    threadId,
  );

  if (
    !hasAiPermission ||
    !isInboxEnabled ||
    !isDefined(agentChatThreadParticipants) ||
    scope === 'NONE'
  ) {
    return undefined;
  }

  return TRIAGE_STATUS_BY_SCOPE[scope];
};
