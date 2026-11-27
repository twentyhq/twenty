import { FeatureFlagKey } from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { INBOX_NAMES_BY_LEGACY_NAME } from '@/ai-chat/constants/InboxNamesByLegacyName';
import { LEGACY_INBOX_NAMES_BY_LEGACY_NAME } from '@/ai-chat/constants/LegacyInboxNamesByLegacyName';
import { type InboxNamesByLegacyName } from '@/ai-chat/types/InboxNamesByLegacyName';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';

export const inboxNamesByLegacyNameSelector =
  createAtomSelector<InboxNamesByLegacyName>({
    key: 'inboxNamesByLegacyNameSelector',
    get: ({ get }) =>
      checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED,
        get(currentWorkspaceState),
      )
        ? INBOX_NAMES_BY_LEGACY_NAME
        : LEGACY_INBOX_NAMES_BY_LEGACY_NAME,
  });
