import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof KeyboardShortcutMenu> = {
  title: 'Modules/KeyboardShortcutMenu/KeyboardShortcutMenu',
  component: KeyboardShortcutMenu,
  decorators: [
    (Story) => {
      const { openKeyboardShortcutMenu } = useKeyboardShortcutMenu();
      return (
        <>
          <Button onClick={openKeyboardShortcutMenu}>Open shortcuts</Button>
          <Story />
        </>
      );
    },
    ToastDecorator,
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutMenu>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open shortcuts' });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Keyboard shortcuts',
    });
    const closeButton = within(dialog).getByRole('button', {
      name: 'Close keyboard shortcuts',
    });
    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() => expect(closeButton).toHaveFocus());
    for (const name of ['Table', 'Side Panel', 'General']) {
      expect(within(dialog).getByRole('group', { name })).toBeVisible();
      expect(within(dialog).getByRole('heading', { name })).toHaveAttribute(
        'data-size',
        'md',
      );
    }
    await userEvent.tab();
    await waitFor(() => expect(closeButton).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Shift>}?{/Shift}');
    const reopenedDialog = await body.findByRole('dialog', {
      name: 'Keyboard shortcuts',
    });
    await userEvent.click(
      within(reopenedDialog).getByRole('button', {
        name: 'Close keyboard shortcuts',
      }),
    );
    await waitFor(() => expect(reopenedDialog).not.toBeInTheDocument());
  },
};
