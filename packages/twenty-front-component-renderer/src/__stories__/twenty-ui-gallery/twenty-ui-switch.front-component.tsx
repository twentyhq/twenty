import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Switch } from 'twenty-ui/input';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const SwitchExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <TwentyUiGalleryCard title="Switch">
      <Switch
        aria-label="Email notifications"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <Switch aria-label="Uncontrolled notifications" defaultChecked />
      <Switch aria-label="Disabled notifications" disabled />
      <p role="status">Notifications: {checked ? 'enabled' : 'disabled'}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840010',
  name: 'twenty-ui-switch',
  description:
    'Switch controlled, uncontrolled and disabled behavior in the sandbox',
  component: SwitchExample,
});
