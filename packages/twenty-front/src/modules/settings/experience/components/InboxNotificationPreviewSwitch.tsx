import { useLingui } from '@lingui/react/macro';
import { IconEye } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { INBOX_NOTIFICATION_LEVEL } from '@/inbox/constants/InboxNotificationLevel';
import { inboxNotificationLevelState } from '@/inbox/states/inboxNotificationLevelState';
import { isInboxNotificationPreviewEnabledState } from '@/inbox/states/isInboxNotificationPreviewEnabledState';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const InboxNotificationPreviewSwitch = () => {
  const { t } = useLingui();
  const inboxNotificationLevel = useAtomStateValue(inboxNotificationLevelState);
  const [
    isInboxNotificationPreviewEnabled,
    setIsInboxNotificationPreviewEnabled,
  ] = useAtomState(isInboxNotificationPreviewEnabledState);

  return (
    <Card.Root fullWidth>
      <SettingsOptionCardContentSwitch
        Icon={IconEye}
        title={t`Show message preview`}
        description={t`Show the message text in notifications. Turn it off when you share your screen`}
        checked={isInboxNotificationPreviewEnabled}
        disabled={inboxNotificationLevel === INBOX_NOTIFICATION_LEVEL.NONE}
        onChange={setIsInboxNotificationPreviewEnabled}
      />
    </Card.Root>
  );
};
