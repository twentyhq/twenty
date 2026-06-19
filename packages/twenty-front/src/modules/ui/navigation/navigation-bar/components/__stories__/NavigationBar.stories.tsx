import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  IconCheckbox,
  IconList,
  IconSearch,
  IconSettings,
} from 'twenty-ui/icon';
import { NavigationBar } from 'twenty-ui/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

const meta: Meta<typeof NavigationBar> = {
  title: 'UI/Navigation/NavigationBar/NavigationBar',
  component: NavigationBar,
  args: {
    activeItemName: 'main',
    items: [
      { name: 'main', label: 'Main', Icon: IconList, onClick: () => undefined },
      {
        name: 'search',
        label: 'Search',
        Icon: IconSearch,
        onClick: () => undefined,
      },
      {
        name: 'tasks',
        label: 'Tasks',
        Icon: IconCheckbox,
        onClick: () => undefined,
      },
      {
        name: 'settings',
        label: 'Settings',
        Icon: IconSettings,
        onClick: () => undefined,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};
