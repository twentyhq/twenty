import { msg } from '@lingui/core/macro';
import { IconAt, IconBell, IconBellOff } from 'twenty-ui/icon';

import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { useInboxNotificationPreferences } from '@/settings/experience/hooks/useInboxNotificationPreferences';
import { InboxNotificationLevel } from '~/generated-metadata/graphql';

const inboxNotificationLevelOptions = [
  {
    value: InboxNotificationLevel.ALL,
    title: msg`All chats you follow`,
    description: msg`Every new message in a chat you take part in or follow`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBell} />,
  },
  {
    value: InboxNotificationLevel.DIRECT_AND_MENTIONS,
    title: msg`Direct messages and mentions`,
    description: msg`Direct messages, mentions and chats assigned to you`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconAt} />,
  },
  {
    value: InboxNotificationLevel.NONE,
    title: msg`Off`,
    description: msg`No notification for new messages`,
    cardMedia: <SettingsOptionIconCustomizer Icon={IconBellOff} />,
  },
];

export const InboxNotificationLevelPicker = () => {
  const { inboxNotificationLevel, setInboxNotificationLevel } =
    useInboxNotificationPreferences();

  return (
    <SettingsRadioSettingsCard
      name="inbox-notification-level"
      onChange={(value: InboxNotificationLevel) =>
        void setInboxNotificationLevel(value)
      }
      options={inboxNotificationLevelOptions}
      value={inboxNotificationLevel}
    />
  );
};
