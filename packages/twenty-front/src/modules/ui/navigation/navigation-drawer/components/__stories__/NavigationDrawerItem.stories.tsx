import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { CatalogDecorator, CatalogStory, IconSearch } from 'twenty-ui';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

import { getOsControlSymbol } from '@ui/utilities/device/getOsControlSymbol';
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

export const Breadcrumb: Story = {
  decorators: [
    (Story) => (
      <StyledContainer>
        <h1>Breadcrumb</h1>
        <Story
          args={{
            indentationLevel: 1,
            label: 'Search',
            Icon: IconSearch,
          }}
        />
        <Story
          args={{
            indentationLevel: 2,
            subItemState: 'intermediate-before-selected',
            label: 'First not selected',
            Icon: IconSearch,
          }}
        />
        <Story
          args={{
            indentationLevel: 2,
            subItemState: 'intermediate-before-selected',
            label: 'Before selected',
            Icon: IconSearch,
          }}
        />
        <Story
          args={{
            indentationLevel: 2,
            subItemState: 'intermediate-selected',
            label: 'Selected',
            Icon: IconSearch,
          }}
        />
        <Story
          args={{
            indentationLevel: 2,
            subItemState: 'intermediate-after-selected',
            label: 'After selected',
            Icon: IconSearch,
          }}
        />
        <Story
          args={{
            indentationLevel: 2,
            subItemState: 'last-not-selected',
            label: 'Last not selected',
            Icon: IconSearch,
          }}
        />
      </StyledContainer>
    ),
    ComponentWithRouterDecorator,
  ],
};

export const BreadcrumbCatalog: CatalogStory<
  Story,
  typeof NavigationDrawerItem
> = {
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    CatalogDecorator,
    MemoryRouterDecorator,
  ],
  args: {
    indentationLevel: 2,
  },
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'subItemState',
          values: [
            'Intermediate before selected',
            'Intermediate selected',
            'Intermediate after selected',
            'Last not selected',
            'Last selected',
          ],
          props: (state: string) => {
            switch (state) {
              case 'Intermediate before selected':
                return { subItemState: 'intermediate-before-selected' };
              case 'Intermediate selected':
                return { subItemState: 'intermediate-selected' };
              case 'Intermediate after selected':
                return { subItemState: 'intermediate-after-selected' };
              case 'Last not selected':
                return { subItemState: 'last-not-selected' };
              case 'Last selected':
                return { subItemState: 'last-selected' };
              default:
                throw new Error(`Unknown state: ${state}`);
            }
          },
        },
      ],
    },
  },
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
                  ? { keyboard: [getOsControlSymbol(), 'K'] }
                  : {},
        },
      ],
    },
  },
};
