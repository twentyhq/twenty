import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Popover } from 'twenty-ui/surfaces';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const PopoverExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <TwentyUiGalleryCard title="Popover">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger>Account details</Popover.Trigger>
        <Popover.Popup>
          <Popover.Title>Account owner</Popover.Title>
          <Popover.Description>Alice manages this account</Popover.Description>
          <Popover.Close>Close details</Popover.Close>
        </Popover.Popup>
      </Popover.Root>
      <p role="status">Details: {open ? 'open' : 'closed'}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840005',
  name: 'twenty-ui-popover',
  description: 'Popover opening, portal content and dismissal in the sandbox',
  component: PopoverExample,
});
