import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { ContextMenu } from '../ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu/ContextMenu',
  component: ContextMenu,
  decorators: [ComponentDecorator],
  args: { selectedIds: [] },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {};
