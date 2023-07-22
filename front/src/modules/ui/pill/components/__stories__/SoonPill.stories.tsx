import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators';

import { SoonPill } from '../SoonPill';

const meta: Meta<typeof SoonPill> = {
  title: 'UI/Accessories/SoonPill',
  component: SoonPill,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SoonPill>;

export const Default: Story = {};
