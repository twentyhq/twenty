import { Meta, StoryObj } from '@storybook/react';

import {
  ComponentDecorator,
  IconBuildingSkyscraper,
  IconUser,
} from 'twenty-ui';
import { CommandMenuContextChip } from '../CommandMenuContextChip';

const meta: Meta<typeof CommandMenuContextChip> = {
  title: 'Modules/CommandMenu/CommandMenuContextChip',
  component: CommandMenuContextChip,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof CommandMenuContextChip>;

export const SingleIcon: Story = {
  args: {
    Icons: [<IconUser size={16} />],
    text: 'Person',
  },
};

export const MultipleIcons: Story = {
  args: {
    Icons: [<IconUser size={16} />, <IconBuildingSkyscraper size={16} />],
    text: 'Person & Company',
  },
};

export const IconsOnly: Story = {
  args: {
    Icons: [<IconUser size={16} />, <IconBuildingSkyscraper size={16} />],
  },
};
