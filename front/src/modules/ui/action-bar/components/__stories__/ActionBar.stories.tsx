import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators';

import { ActionBar } from '../ActionBar';

const meta: Meta<typeof ActionBar> = {
  title: 'UI/ActionBar/ActionBar',
  component: ActionBar,
  decorators: [ComponentDecorator],
  args: { children: 'Lorem ipsum', selectedIds: [] },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};
