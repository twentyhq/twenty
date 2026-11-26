import { FeatureFlagKey } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { INBOX_OBJECT_NAMES } from '@/ai-chat/constants/InboxObjectNames';
import { LEGACY_INBOX_OBJECT_NAMES } from '@/ai-chat/constants/LegacyInboxObjectNames';
import { type InboxObjectNames } from '@/ai-chat/types/InboxObjectNames';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';

export const inboxObjectNamesSelector = createAtomSelector<InboxObjectNames>({
  key: 'inboxObjectNamesSelector',
  get: ({ get }) =>
    checkIfFeatureFlagIsEnabledOnWorkspace(
      FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED,
      get(currentWorkspaceState),
    )
      ? INBOX_OBJECT_NAMES
      : LEGACY_INBOX_OBJECT_NAMES,
});
