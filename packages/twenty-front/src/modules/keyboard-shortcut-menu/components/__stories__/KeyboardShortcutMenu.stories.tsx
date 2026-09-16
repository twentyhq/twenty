import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useEffect } from 'react';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof KeyboardShortcutMenu> = {
  title: 'Modules/KeyboardShortcutMenu/KeyboardShortcutMenu',
  component: KeyboardShortcutMenu,
  decorators: [
    (Story) => {
      const { openKeyboardShortcutMenu } = useKeyboardShortcutMenu();
      useEffect(() => {
        openKeyboardShortcutMenu();
      }, [openKeyboardShortcutMenu]);
      return <Story />;
    },
    ToastDecorator,
    ComponentWithRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutMenu>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Keyboard shortcuts')).toBeInTheDocument();
  },
};
