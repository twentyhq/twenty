import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { Tabs } from 'twenty-ui/navigation';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const TabsExample = () => {
  const [value, setValue] = useState('overview');

  return (
    <ThemeProvider colorScheme="light">
      <FrontComponentCard title="Tabs">
        <Tabs.Root value={value} onValueChange={setValue}>
          <Tabs.List aria-label="Account sections">
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="disabled" disabled>
              Unavailable
            </Tabs.Tab>
            <Tabs.Tab value="activity">Activity</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="overview">Account overview</Tabs.Panel>
          <Tabs.Panel value="activity">Recent activity</Tabs.Panel>
        </Tabs.Root>
        <p role="status">Section: {value}</p>
      </FrontComponentCard>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840004',
  name: 'twenty-ui-tabs',
  description: 'Tabs selection and keyboard navigation in the sandbox',
  component: TabsExample,
});
