import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { IconSearch } from 'twenty-ui';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { CatalogStory } from '~/testing/types';

import { NavigationDrawerItem } from '../NavigationDrawerItem';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
`;

const meta: Meta<typeof NavigationDrawerItem> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawerItem',
  component: NavigationDrawerItem,
  args: {
    label: 'Search',
    Icon: IconSearch,
  },
  argTypes: { Icon: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawerItem>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    ComponentWithRouterDecorator,
  ],
};

export const Catalog: CatalogStory<Story, typeof NavigationDrawerItem> = {
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    CatalogDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'danger',
          values: [true, false],
          props: (danger: boolean) => ({ danger }),
          labels: (danger: boolean) => (danger ? 'Danger' : 'No Danger'),
        },
        {
          name: 'active',
          values: [true, false],
          props: (active: boolean) => ({ active }),
          labels: (active: boolean) => (active ? 'Active' : 'Inactive'),
        },
        {
          name: 'states',
          values: ['Default', 'Hover'],
          props: (state: string) => ({
            className: state === 'Hover' ? 'hover' : undefined,
          }),
        },
        {
          name: 'adornments',
          values: ['Without Adornments', 'Soon Pill', 'Count', 'Keyboard Keys'],
          props: (adornmentName: string) =>
            adornmentName === 'Soon Pill'
              ? { soon: true }
              : adornmentName === 'Count'
                ? { count: 3 }
                : adornmentName === 'Keyboard Keys'
                  ? { keyboard: ['⌘', 'K'] }
                  : {},
        },
      ],
    },
  },
};
