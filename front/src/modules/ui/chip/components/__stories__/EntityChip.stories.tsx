import type { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { EntityChip } from '../EntityChip';

const meta: Meta<typeof EntityChip> = {
  title: 'UI/Chip/EntityChip',
  component: EntityChip,
  decorators: [ComponentWithRouterDecorator],
  args: {
    name: 'Entity name',
    linkToEntity: '/entity-link',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof EntityChip>;

export const Default: Story = {};
