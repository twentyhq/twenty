import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { Switch } from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const SwitchExample = () => {
  const [checked, setChecked] = useState(false);

  return (
    <ThemeProvider colorScheme="light">
      <FrontComponentCard title="Switch">
        <Switch
          aria-label="Email notifications"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <Switch aria-label="Uncontrolled notifications" defaultChecked />
        <Switch aria-label="Disabled notifications" disabled />
        <p role="status">Notifications: {checked ? 'enabled' : 'disabled'}</p>
      </FrontComponentCard>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840010',
  name: 'twenty-ui-switch',
  description:
    'Switch controlled, uncontrolled and disabled behavior in the sandbox',
  component: SwitchExample,
});
