import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  IconCheckbox,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { NavigationBar } from 'twenty-ui/navigation';

const meta: Meta<typeof NavigationBar> = {
  title: 'UI/Navigation/NavigationBar/NavigationBar',
  component: NavigationBar,
  args: {
    activeItemName: 'main',
    items: [
      { name: 'main', Icon: IconList, onClick: () => undefined },
      { name: 'search', Icon: IconSearch, onClick: () => undefined },
      { name: 'tasks', Icon: IconCheckbox, onClick: () => undefined },
      { name: 'settings', Icon: IconSettings, onClick: () => undefined },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};
