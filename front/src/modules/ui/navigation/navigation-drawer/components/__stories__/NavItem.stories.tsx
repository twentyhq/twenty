import styled from '@emotion/styled';
import { Decorator, Meta, StoryObj } from '@storybook/react';

import { IconSearch, IconSettings } from '@/ui/display/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { CatalogStory } from '~/testing/types';

import NavItem from '../NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'UI/Navigation/NavigationDrawer/NavItem',
  component: NavItem,
  args: {
    label: 'Search',
    Icon: IconSearch,
    active: true,
  },
  argTypes: { Icon: { control: false } },
};

const StyledNavItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
`;

const ComponentDecorator: Decorator = (Story) => (
  <StyledNavItemContainer>
    <Story />
  </StyledNavItemContainer>
);

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = { 
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};

export const Catalog: CatalogStory<Story, typeof NavItem> = {
  decorators: [
    ComponentDecorator,
    CatalogDecorator,
    ComponentWithRouterDecorator,
  ],
  parameters: {
    pseudo: { hover: ['button:has(svg.tabler-icon-settings)'] },
    catalog: {
      dimensions: [
        {
          name: 'active',
          values: [true, false],
          props: (active: boolean) => ({ active }),
          labels: (active: boolean) => (active ? 'Active' : 'Inactive'),
        },
        {
          name: 'danger',
          values: [true, false],
          props: (danger: boolean) => ({ danger }),
          labels: (danger: boolean) => (danger ? 'Danger' : 'No Danger'),
        },
        {
          name: 'states',
          values: ['Default', 'Hover'],
          props: (state: string) =>
            state === 'Default'
              ? {}
              : { label: 'Settings', Icon: IconSettings },
        },
      ],
    },
  },
};

export const WithSoonPill: Story = {
  ...Default,
  args: {
    active: false,
    soon: true,
  },
};

export const WithCount: Story = {
  ...Default,
  args: {
    count: 3,
  },
};

export const WithKeyboardKeys: Story = {
  ...Default,
  args: {
    className: "hover",
    keyboard: ['⌘', 'K'],
  },
  parameters: {
    pseudo: { hover: [".hover"] },
  }
};
