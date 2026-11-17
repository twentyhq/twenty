import { msg } from '@lingui/core/macro';
import { IconAt, IconBell, IconBellOff } from 'twenty-ui/icon';

import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';
import { inboxNotificationLevelState } from '@/inbox/states/inboxNotificationLevelState';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const inboxNotificationLevelOptions = [
  {
    value: INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    title: msg`All chats you follow`,
    description: msg`Every new message in a chat you take part in or follow`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBell} />,
  },
  {
    value: INBOX_NOTIFICATION_LEVEL.DIRECT_AND_MENTIONS,
    title: msg`Direct messages and mentions`,
    description: msg`Direct messages, mentions and chats assigned to you`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconAt} />,
  },
  {
    value: INBOX_NOTIFICATION_LEVEL.NONE,
    title: msg`Off`,
    description: msg`No notification for new messages`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBellOff} />,
  },
];

export const InboxNotificationLevelPicker = () => {
  const [inboxNotificationLevel, setInboxNotificationLevel] = useAtomState(
    inboxNotificationLevelState,
  );

  return (
    <SettingsRadioSettingsCard
      name="inbox-notification-level"
      onChange={setInboxNotificationLevel}
      options={inboxNotificationLevelOptions}
      value={inboxNotificationLevel}
    />
  );
};
