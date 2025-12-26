import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useEffect } from 'react';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { KeyboardShortcutMenu } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenu';

const meta: Meta<typeof KeyboardShortcutMenu> = {
  title: 'Modules/KeyboardShortcutMenu/KeyboardShortcutMenu',
  component: KeyboardShortcutMenu,
  decorators: [
    I18nFrontDecorator,
    (Story) => {
      const { openKeyboardShortcutMenu } = useKeyboardShortcutMenu();
      useEffect(() => {
        openKeyboardShortcutMenu();
      }, [openKeyboardShortcutMenu]);
      return <Story />;
    },
    SnackBarDecorator,
    ComponentWithRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutMenu>;

export const Default: Story = {
  play: async () => {
    const canvas = within(document.body);

    expect(await canvas.findByText('Keyboard shortcuts')).toBeInTheDocument();
  },
};
