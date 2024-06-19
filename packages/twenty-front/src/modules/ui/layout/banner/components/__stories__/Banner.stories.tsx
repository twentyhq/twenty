import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator, IconRefresh } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';

import { Banner } from '../Banner';

const meta: Meta<typeof Banner> = {
  title: 'UI/Layout/Banner/Banner',
  component: Banner,
  decorators: [ComponentDecorator],
  render: (args) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Banner {...args}>
      Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
      <Button
        variant="secondary"
        title="Reconnect"
        Icon={IconRefresh}
        size="small"
        inverted
      />
    </Banner>
  ),
  argTypes: {
    as: { control: false },
    theme: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {};
