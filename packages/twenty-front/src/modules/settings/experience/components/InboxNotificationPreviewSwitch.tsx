import { useLingui } from '@lingui/react/macro';
import { IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useInboxNotificationPreferences } from '@/settings/experience/hooks/useInboxNotificationPreferences';
import { InboxNotificationLevel } from '~/generated-metadata/graphql';

export const InboxNotificationPreviewSwitch = () => {
  const { t } = useLingui();
  const {
    inboxNotificationLevel,
    isInboxNotificationPreviewEnabled,
    setIsInboxNotificationPreviewEnabled,
  } = useInboxNotificationPreferences();

  return (
    <Card.Root fullWidth>
      <SettingsOptionCardContentSwitch
        Icon={IconEye}
        title={t`Show message preview`}
        description={t`Show the message text in notifications. Turn it off when you share your screen`}
        checked={isInboxNotificationPreviewEnabled}
        disabled={inboxNotificationLevel === InboxNotificationLevel.NONE}
        onChange={(checked) =>
          void setIsInboxNotificationPreviewEnabled(checked)
        }
      />
    </Card.Root>
  );
};
