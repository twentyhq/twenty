import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button, Input } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { Modal } from '@/ui/layout/modal/components/Modal';
import { ModalContent } from '@/ui/layout/modal/components/ModalContent';
import { ModalFooter } from '@/ui/layout/modal/components/ModalFooter';
import { ModalHeader } from '@/ui/layout/modal/components/ModalHeader';

const meta: Meta<typeof Modal> = {
  title: 'UI/Layout/Modal/Presentation',
  component: Modal,
  decorators: [ComponentDecorator],
  args: { isOpen: true, ariaLabel: 'Account details' },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Layout: Story = {
  args: {
    padding: 'none',
    children: (
      <>
        <ModalHeader autoHeight noPadding hasBorderBottom>
          Account details
        </ModalHeader>
        <ModalContent contentPadding={3} gap={2}>
          Account information
        </ModalContent>
        <ModalFooter autoHeight smallPadding centered>
          <Button title="Save" aria-label="Save" />
        </ModalFooter>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Account details' });
    await waitFor(() => expect(dialog).toBeVisible());
    expect(getComputedStyle(dialog).width).toBe('400px');
    expect(getComputedStyle(dialog).padding).toBe('0px');
    const header = within(dialog).getByText('Account details');
    expect(getComputedStyle(header).padding).toBe('0px');
    expect(getComputedStyle(header).borderBottomWidth).toBe('1px');
    const content = within(dialog).getByText('Account information');
    expect(getComputedStyle(content).padding).toBe('12px');
    expect(getComputedStyle(content).gap).toBe('8px');
    const footer = within(dialog)
      .getByRole('button', { name: 'Save' })
      .closest('[data-centered]');
    expect(footer).not.toBeNull();
    expect(getComputedStyle(footer!).justifyContent).toBe('center');
    expect(getComputedStyle(footer!).padding).toBe('12px');
  },
};

export const ConfirmationLayout: Story = {
  args: {
    padding: 'large',
    smallBorderRadius: true,
    narrowWidth: true,
    autoHeight: true,
    gap: 2,
    children: <Button title="Confirm" aria-label="Confirm" />,
  },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    const style = getComputedStyle(dialog);
    expect(style.width).toBe('272px');
    expect(style.padding).toBe('24px');
    expect(style.borderRadius).toBe('4px');
    expect(style.gap).toBe('8px');
  },
};

export const MobileLayout: Story = {
  args: { isMobile: true, children: 'Account details' },
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    const viewport = canvasElement.ownerDocument.documentElement;
    expect(dialog.getBoundingClientRect().width).toBe(viewport.clientWidth);
    expect(dialog.getBoundingClientRect().height).toBe(viewport.clientHeight);
    expect(getComputedStyle(dialog).borderRadius).toBe('0px');
  },
};

const ContainerModal = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      data-testid="modal-container"
      style={{ position: 'relative', width: 600, height: 400 }}
    >
      <Modal
        isOpen
        container={container}
        isInContainer
        ariaLabel="Contained dialog"
      >
        <Input aria-label="Account name" />
      </Modal>
    </div>
  );
};

export const ExternallyManagedBehavior: Story = {
  args: { children: <Input aria-label="Account name" /> },
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const dialog = await body.findByRole('dialog');
    const input = within(dialog).getByRole('textbox', { name: 'Account name' });
    expect(document.body.style.overflow).not.toBe('hidden');
    expect(input).not.toHaveFocus();
    const onKeyDown = fn();
    document.addEventListener('keydown', onKeyDown);
    try {
      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      expect(onKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ArrowDown' }),
      );
      await userEvent.keyboard('{Escape}');
      await userEvent.click(body.getByTestId('modal-backdrop'));
      expect(dialog).toBeVisible();
    } finally {
      document.removeEventListener('keydown', onKeyDown);
    }
  },
};

export const ContainedLayout: Story = {
  render: () => <ContainerModal />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByTestId('modal-container');
    const dialog = await within(container).findByRole('dialog');
    expect(container).toContainElement(dialog);
    expect(
      getComputedStyle(within(container).getByTestId('modal-backdrop'))
        .position,
    ).toBe('absolute');
    expect(
      within(container).getByTestId('modal-backdrop').getBoundingClientRect()
        .width,
    ).toBe(container.getBoundingClientRect().width);
  },
};
