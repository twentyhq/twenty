import { useLingui } from '@lingui/react/macro';
import { AGENT_CHAT_INBOX_NOTIFICATION_LEVEL } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useUpdateWorkspaceMemberSettings } from '@/workspace-member/hooks/useUpdateWorkspaceMemberSettings';

export const InboxNotificationPreviewSwitch = () => {
  const { t } = useLingui();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const setIsInboxNotificationPreviewEnabled = async (
    isInboxNotificationPreviewEnabled: boolean,
  ) => {
    setCurrentWorkspaceMember({
      ...currentWorkspaceMember,
      isInboxNotificationPreviewEnabled,
    });
    await updateWorkspaceMemberSettings({
      workspaceMemberId: currentWorkspaceMember.id,
      update: { isInboxNotificationPreviewEnabled },
    });
  };

  return (
    <Card.Root fullWidth>
      <SettingsOptionCardContentSwitch
        Icon={IconEye}
        title={t`Show message preview`}
        description={t`Show the message text in notifications. Turn it off when you share your screen`}
        checked={
          currentWorkspaceMember.isInboxNotificationPreviewEnabled ?? true
        }
        disabled={
          currentWorkspaceMember.inboxNotificationLevel ===
          AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE
        }
        onChange={(isChecked) =>
          void setIsInboxNotificationPreviewEnabled(isChecked)
        }
      />
    </Card.Root>
  );
};
