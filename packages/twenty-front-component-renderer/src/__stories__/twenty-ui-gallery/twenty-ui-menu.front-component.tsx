import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { Menu } from 'twenty-ui/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const MenuExample = () => {
  const [action, setAction] = useState('none');

  return (
    <ThemeProvider colorScheme="light">
      <FrontComponentCard title="Menu">
        <Menu.Root>
          <Menu.Trigger>Account actions</Menu.Trigger>
          <Menu.Popup>
            <Menu.Group>
              <Menu.GroupLabel>Record</Menu.GroupLabel>
              <Menu.Item onClick={() => setAction('duplicated')}>
                Duplicate
              </Menu.Item>
              <Menu.Item disabled onClick={() => setAction('archived')}>
                Archive
              </Menu.Item>
            </Menu.Group>
            <Menu.Separator />
            <Menu.Item onClick={() => setAction('exported')}>Export</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <p role="status">Action: {action}</p>
      </FrontComponentCard>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840006',
  name: 'twenty-ui-menu',
  description: 'Menu portal, activation and disabled items in the sandbox',
  component: MenuExample,
});
