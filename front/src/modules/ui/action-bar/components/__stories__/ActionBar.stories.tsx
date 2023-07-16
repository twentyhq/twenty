import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { ActionBar } from '../ActionBar';

const meta: Meta<typeof ActionBar> = {
  title: 'UI/ActionBar/ActionBar',
  component: ActionBar,
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <ActionBar children={<div />} selectedIds={[]} />,
  ),
};
