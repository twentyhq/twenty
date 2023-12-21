import { Meta, StoryObj } from '@storybook/react';

import { Threads } from '../Threads';

const meta: Meta<typeof Threads> = {
  title: 'Modules/Activity/Emails/Threads',
  component: Threads,
  args: {
    entity: {
      type: 'Person',
      id: '52ba3fd0-c723-4482-8b11-5fc24a587c71',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Threads>;

export const Default: Story = {};
