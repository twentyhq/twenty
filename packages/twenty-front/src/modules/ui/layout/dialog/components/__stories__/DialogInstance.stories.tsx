import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { ComponentDecorator } from 'twenty-ui/testing';

import { Select } from '@/ui/input/components/Select';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { DialogContainerContext } from '@/ui/layout/dialog/contexts/DialogContainerContext';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { RootDecorator } from '~/testing/decorators/RootDecorator';

const DIALOG_ID = 'dialog-instance-story';

type DialogInstanceExampleProps = Omit<
  ComponentProps<typeof DialogInstance>,
  'dialogId' | 'children'
>;

const DialogInstanceExample = (props: DialogInstanceExampleProps) => {
  const { openDialog } = useDialog();
  const [choice, setChoice] = useState('first');

  return (
    <>
      <Button onClick={() => openDialog(DIALOG_ID)}>Open dialog</Button>
      <DialogInstance {...props} dialogId={DIALOG_ID}>
        {({ container, backdrop, viewportProps, onKeyDown }) => (
          <Dialog.Popup {...{ container, backdrop, viewportProps, onKeyDown }}>
            <Dialog.Header>
              <Dialog.Title>Workspace preferences</Dialog.Title>
              <Dialog.Description>Choose a preference.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <Select
                dropdownId="dialog-instance-choice"
                label="Preference"
                value={choice}
                onChange={setChoice}
                options={[
                  { value: 'first', label: 'First option' },
                  { value: 'second', label: 'Second option' },
                ]}
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button>Close dialog</Button>} />
            </Dialog.Footer>
          </Dialog.Popup>
        )}
      </DialogInstance>
    </>
  );
};

const meta: Meta<typeof DialogInstanceExample> = {
  title: 'UI/Layout/Dialog/DialogInstance',
  component: DialogInstanceExample,
  decorators: [RootDecorator, ComponentDecorator],
  args: { dismissible: true, onClose: fn() },
};

export default meta;
type Story = StoryObj<typeof DialogInstanceExample>;

export const OpenAndRestoreFocus: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open dialog',
    });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Workspace preferences',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close dialog' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const CloseOnEscape: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const TrapFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    await userEvent.tab();
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
    await userEvent.tab();
    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true),
    );
  },
};

export const CloseOnOutsidePress: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await body.findByRole('dialog');
    await userEvent.click(body.getByTestId('dialog-viewport'));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const PreventDismissal: Story = {
  args: { dismissible: false },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await body.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(body.getByTestId('dialog-viewport'));
    await waitFor(() => expect(dialog).toBeVisible());
    expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close dialog' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const DeferDismissal: Story = {
  args: { closeOnDismiss: false },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(args.onClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog).toBeVisible());
  },
};

export const PortaledDropdown: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open dialog' }),
    );
    const dialog = await body.findByRole('dialog');
    await userEvent.click(within(dialog).getByText('First option'));
    await userEvent.click(await body.findByText('Second option'));
    expect(within(dialog).getByText('Second option')).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByText('Second option'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

const ContainedDialogExample = (props: DialogInstanceExampleProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setContainer}
      data-testid="dialog-container"
      style={{ position: 'relative', width: 640, height: 480 }}
    >
      <DialogContainerContext.Provider value={{ container }}>
        <DialogInstanceExample {...props} />
      </DialogContainerContext.Provider>
    </div>
  );
};

export const ScopedContainer: Story = {
  render: (args) => <ContainedDialogExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
    const container = canvas.getByTestId('dialog-container');
    const dialog = await within(container).findByRole('dialog');
    const viewport = within(container).getByTestId('dialog-viewport');
    expect(getComputedStyle(viewport).position).toBe('absolute');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close dialog' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
