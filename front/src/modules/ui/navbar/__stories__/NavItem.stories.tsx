import styled from '@emotion/styled';
import { Decorator, Meta, StoryObj } from '@storybook/react';

import { IconSearch, IconSettings } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import NavItem from '../components/NavItem';

const meta: Meta<typeof NavItem> = {
  title: 'UI/Navbar/NavItem',
  component: NavItem,
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
  args: {
    label: 'Search',
    Icon: IconSearch,
    onClick: () => console.log('clicked'),
    active: true,
  },
  argTypes: { Icon: { control: false }, onClick: { control: false } },
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};

export const Catalog: Story = {
  args: Default.args,
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

export const Soon: Story = {
  args: {
    ...Default.args,
    active: false,
    soon: true,
  },
  argTypes: { Icon: { control: false }, onClick: { control: false } },
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};

export const Count: Story = {
  args: {
    ...Default.args,
    count: 3,
  },
  argTypes: { Icon: { control: false }, onClick: { control: false } },
  decorators: [ComponentDecorator, ComponentWithRouterDecorator],
};
