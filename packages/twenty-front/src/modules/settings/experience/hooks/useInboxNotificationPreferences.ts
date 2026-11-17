import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useUpdateWorkspaceMemberSettings } from '@/workspace-member/hooks/useUpdateWorkspaceMemberSettings';
import { InboxNotificationLevel } from '~/generated-metadata/graphql';

export const useInboxNotificationPreferences = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  const inboxNotificationLevel =
    currentWorkspaceMember?.inboxNotificationLevel ??
    InboxNotificationLevel.ALL;
  const isInboxNotificationPreviewEnabled =
    currentWorkspaceMember?.isInboxNotificationPreviewEnabled ?? true;

  const setInboxNotificationLevel = useCallback(
    async (value: InboxNotificationLevel) => {
      if (!isDefined(currentWorkspaceMember)) {
        return;
      }

      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: { inboxNotificationLevel: value },
      });
    },
    [currentWorkspaceMember, updateWorkspaceMemberSettings],
  );

  const setIsInboxNotificationPreviewEnabled = useCallback(
    async (value: boolean) => {
      if (!isDefined(currentWorkspaceMember)) {
        return;
      }

      await updateWorkspaceMemberSettings({
        workspaceMemberId: currentWorkspaceMember.id,
        update: { isInboxNotificationPreviewEnabled: value },
      });
    },
    [currentWorkspaceMember, updateWorkspaceMemberSettings],
  );

  return {
    inboxNotificationLevel,
    isInboxNotificationPreviewEnabled,
    setInboxNotificationLevel,
    setIsInboxNotificationPreviewEnabled,
  };
};
