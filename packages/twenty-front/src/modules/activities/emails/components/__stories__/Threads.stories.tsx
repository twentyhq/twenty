import { Meta, StoryObj } from '@storybook/react';

import { Threads } from '../Threads';

const meta: Meta<typeof Threads> = {
  title: 'Modules/Activity/Emails/Threads',
  component: Threads,
};

export default meta;
type Story = StoryObj<typeof Threads>;

export const Default: Story = {};
