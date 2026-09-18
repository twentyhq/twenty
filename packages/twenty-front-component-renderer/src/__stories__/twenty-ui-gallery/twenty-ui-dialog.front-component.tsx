import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const DialogExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <TwentyUiGalleryCard title="Dialog">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger render={<Button>Edit account</Button>} />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>Edit account</Dialog.Title>
            <Dialog.Description>Update the account details.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>Account details</Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close render={<Button>Close</Button>} />
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Root>
      <Text role="status">Dialog: {open ? 'open' : 'closed'}</Text>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000111',
  name: 'twenty-ui-dialog',
  description: 'Dialog opening and closing through a sandbox portal',
  component: DialogExample,
});
