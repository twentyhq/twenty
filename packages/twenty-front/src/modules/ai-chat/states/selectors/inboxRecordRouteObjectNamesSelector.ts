import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxRecordRouteObjectNamesSelector =
  createAtomSelector<InboxRecordRouteObjectNames | null>({
    key: 'inboxRecordRouteObjectNamesSelector',
    get: ({ get }) => {
      const featureFlags = get(currentWorkspaceState)?.featureFlags ?? [];
      const isInboxViewsEnabled = [
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        FeatureFlagKey.IS_INBOX_VIEWS_ENABLED,
      ].every((featureFlagKey) =>
        featureFlags.some(
          (featureFlag) =>
            featureFlag.key === featureFlagKey && featureFlag.value,
        ),
      );
      const aiChatThreadObjectMetadataItem = get(
        objectMetadataItemFamilySelector,
        {
          objectName: get(inboxNamesByLegacyNameSelector).agentChatThread,
          objectNameType: 'singular',
        },
      );

      if (!isInboxViewsEnabled || !isDefined(aiChatThreadObjectMetadataItem)) {
        return null;
      }

      return {
        nameSingular: aiChatThreadObjectMetadataItem.nameSingular,
        namePlural: aiChatThreadObjectMetadataItem.namePlural,
      };
    },
  });
