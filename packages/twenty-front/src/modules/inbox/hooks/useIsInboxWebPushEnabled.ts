import { isDefined } from 'twenty-shared/utils';

import { webPushVapidPublicKeyState } from '@/client-config/states/webPushVapidPublicKeyState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useIsInboxWebPushEnabled = () => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const webPushVapidPublicKey = useAtomStateValue(webPushVapidPublicKeyState);

  return (
    isAiChatInboxEnabled && hasAiPermission && isDefined(webPushVapidPublicKey)
  );
};
