import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AGENT_CHAT_INBOX_NOTIFICATION_LEVEL } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconAt, IconBell, IconBellOff, IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import {
  type CurrentWorkspaceMember,
  currentWorkspaceMemberState,
} from '@/auth/states/currentWorkspaceMemberState';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useUpdateWorkspaceMemberSettings } from '@/workspace-member/hooks/useUpdateWorkspaceMemberSettings';

const inboxNotificationLevelOptions = [
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    title: msg`All chats you follow`,
    description: msg`Every new message in a chat you take part in or follow`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBell} />,
  },
  {
    value: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED,
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

export const InboxNotificationPreferences = () => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { updateWorkspaceMemberSettings } = useUpdateWorkspaceMemberSettings();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const inboxNotificationLevel =
    inboxNotificationLevelOptions.find(
      ({ value }) => value === currentWorkspaceMember.inboxNotificationLevel,
    )?.value ?? AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED;

  const updateInboxNotificationPreferences = async (
    update: Pick<
      CurrentWorkspaceMember,
      'inboxNotificationLevel' | 'isInboxNotificationPreviewEnabled'
    >,
  ) => {
    await updateWorkspaceMemberSettings({
      workspaceMemberId: currentWorkspaceMember.id,
      update,
    });
  };

  return (
    <>
      <SettingsRadioSettingsCard
        name="inbox-notification-level"
        onChange={(selectedInboxNotificationLevel) =>
          void updateInboxNotificationPreferences({
            inboxNotificationLevel: selectedInboxNotificationLevel,
          })
        }
        options={inboxNotificationLevelOptions}
        value={inboxNotificationLevel}
      />
      <Card.Root fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconEye}
          title={t`Show message preview`}
          description={t`Show the sender, the chat and the message text in notifications. Leave it off on shared screens and devices`}
          checked={
            currentWorkspaceMember.isInboxNotificationPreviewEnabled ?? false
          }
          disabled={
            inboxNotificationLevel === AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE
          }
          onChange={(isChecked) =>
            void updateInboxNotificationPreferences({
              isInboxNotificationPreviewEnabled: isChecked,
            })
          }
        />
      </Card.Root>
    </>
  );
};
