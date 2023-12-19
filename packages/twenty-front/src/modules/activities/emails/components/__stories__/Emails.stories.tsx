import { Meta, StoryObj } from '@storybook/react';

import { Emails } from '../Emails';

const meta: Meta<typeof Emails> = {
  title: 'Modules/Activity/Emails/Emails',
  component: Emails,
};

export default meta;
type Story = StoryObj<typeof Emails>;

export const Default: Story = {};
