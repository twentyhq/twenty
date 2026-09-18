import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { SettingsRow } from 'twenty-ui/components';
import { IconBell } from 'twenty-ui/icon';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SettingsRowExample = () => {
  const [notifications, setNotifications] = useState(false);
  const [changes, setChanges] = useState(0);

  return (
    <TwentyUiGalleryCard title="SettingsRow">
      <SettingsRow
        startIcon={<IconBell aria-hidden />}
        description="Updates by email"
        checked={notifications}
        onCheckedChange={(checked) => {
          setNotifications(checked);
          setChanges((count) => count + 1);
        }}
      >
        Notifications
      </SettingsRow>
      <SettingsRow
        disabled
        onCheckedChange={() => setChanges((count) => count + 1)}
      >
        Disabled notifications
      </SettingsRow>
      <p role="status">
        Notifications: {notifications ? 'enabled' : 'disabled'}; Changes:{' '}
        {changes}
      </p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '68a0e63b-fd20-4515-a733-96f457ceba71',
  name: 'twenty-ui-settings-row',
  description: 'SettingsRow labels and disabled behavior in the sandbox',
  component: SettingsRowExample,
});
