import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { Popover } from 'twenty-ui/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const PopoverExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider colorScheme="light">
      <FrontComponentCard title="Popover">
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger>Account details</Popover.Trigger>
          <Popover.Popup>
            <Popover.Title>Account owner</Popover.Title>
            <Popover.Description>
              Alice manages this account
            </Popover.Description>
            <Popover.Close>Close details</Popover.Close>
          </Popover.Popup>
        </Popover.Root>
        <p role="status">Details: {open ? 'open' : 'closed'}</p>
      </FrontComponentCard>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840005',
  name: 'twenty-ui-popover',
  description: 'Popover opening, portal content and dismissal in the sandbox',
  component: PopoverExample,
});
