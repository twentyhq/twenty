import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { PersonChip } from '../PersonChip';

const meta: Meta<typeof PersonChip> = {
  title: 'Modules/People/PersonChip',
  component: PersonChip,
  decorators: [ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof PersonChip>;

export const SmallName: Story = {
  args: { id: 'tim_fake_id', name: 'Tim C.' },
};

export const BigName: Story = {
  args: { id: 'steve_fake_id', name: 'Steve LoremIpsumLoremIpsumLoremIpsum' },
};
