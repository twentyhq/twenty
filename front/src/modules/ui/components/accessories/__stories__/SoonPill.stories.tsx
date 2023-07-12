import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { SoonPill } from '../SoonPill';

const meta: Meta<typeof SoonPill> = {
  title: 'UI/Accessories/SoonPill',
  component: SoonPill,
};

export default meta;
type Story = StoryObj<typeof SoonPill>;

export const Default: Story = {
  render: getRenderWrapperForComponent(<SoonPill />),
};
