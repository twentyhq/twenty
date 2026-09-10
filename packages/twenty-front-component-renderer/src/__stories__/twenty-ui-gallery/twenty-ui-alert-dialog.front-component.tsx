import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { AlertDialog } from 'twenty-ui/surfaces';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const AlertDialogExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider colorScheme="light">
      <FrontComponentCard title="AlertDialog">
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
          <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
          <AlertDialog.Popup>
            <AlertDialog.Header>
              <AlertDialog.Title>Delete this account?</AlertDialog.Title>
              <AlertDialog.Description>
                This action cannot be undone
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Body>
              All account notes will be removed
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close>Keep account</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Root>
        <p role="status">Confirmation: {open ? 'open' : 'closed'}</p>
      </FrontComponentCard>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '4d23e9af-7cb3-4e4a-bbca-8e960f840009',
  name: 'twenty-ui-alert-dialog',
  description: 'AlertDialog opening and closing through a sandbox portal',
  component: AlertDialogExample,
});
