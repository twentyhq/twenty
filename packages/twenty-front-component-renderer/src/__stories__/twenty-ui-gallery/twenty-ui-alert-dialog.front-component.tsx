import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { AlertDialog } from 'twenty-ui/surfaces';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';

const AlertDialogExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <TwentyUiGalleryCard title="AlertDialog">
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
        <AlertDialog.Popup>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete this account?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Body>All account notes will be removed</AlertDialog.Body>
          <AlertDialog.Footer>
            <AlertDialog.Close>Keep account</AlertDialog.Close>
          </AlertDialog.Footer>
        </AlertDialog.Popup>
      </AlertDialog.Root>
      <p role="status">Confirmation: {open ? 'open' : 'closed'}</p>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840009',
  name: 'twenty-ui-alert-dialog',
  description: 'AlertDialog opening and closing through a sandbox portal',
  component: AlertDialogExample,
});
