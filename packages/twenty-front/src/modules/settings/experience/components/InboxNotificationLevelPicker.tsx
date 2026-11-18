import { msg } from '@lingui/core/macro';
import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxNotificationLevel,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconAt, IconBell, IconBellOff } from 'twenty-ui/icon';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useUpdateWorkspaceMemberSettings } from '@/workspace-member/hooks/useUpdateWorkspaceMemberSettings';

const inboxNotificationLevelOptions = [
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    title: msg`All chats you follow`,
    description: msg`Every new message in a chat you take part in or follow`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBell} />,
  },
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_AND_MENTIONS,
    title: msg`Direct messages and mentions`,
    description: msg`Direct messages, mentions and chats assigned to you`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconAt} />,
  },
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE,
    title: msg`Off`,
    description: msg`No notification for new messages`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBellOff} />,
  },
];

export const InboxNotificationLevelPicker = () => {
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const setInboxNotificationLevel = async (
    inboxNotificationLevel: AgentChatInboxNotificationLevel,
  ) => {
    setCurrentWorkspaceMember({
      ...currentWorkspaceMember,
      inboxNotificationLevel,
    });
    await updateWorkspaceMemberSettings({
      workspaceMemberId: currentWorkspaceMember.id,
      update: { inboxNotificationLevel },
    });
  };

  return (
    <SettingsRadioSettingsCard
      name="inbox-notification-level"
      onChange={setInboxNotificationLevel}
      options={inboxNotificationLevelOptions}
      value={
        inboxNotificationLevelOptions.find(
          ({ value }) =>
            value === currentWorkspaceMember.inboxNotificationLevel,
        )?.value ?? AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED
      }
    />
  );
};
