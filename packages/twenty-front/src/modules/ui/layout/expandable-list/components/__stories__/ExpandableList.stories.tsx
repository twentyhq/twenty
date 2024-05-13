import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'packages/twenty-ui';

import { Tag } from '@/ui/display/tag/components/Tag';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { MAIN_COLOR_NAMES } from '@/ui/theme/constants/MainColorNames';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 300px;
`;

const meta: Meta<typeof ExpandableList> = {
  title: 'UI/Layout/ExpandableList/ExpandableList',
  component: ExpandableList,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    ComponentDecorator,
  ],
  args: {
    children: [
      <Tag key={1} text={'Option 1'} color={MAIN_COLOR_NAMES[0]} />,
      <Tag key={2} text={'Option 2'} color={MAIN_COLOR_NAMES[1]} />,
      <Tag key={3} text={'Option 3'} color={MAIN_COLOR_NAMES[2]} />,
      <Tag key={4} text={'Option 4'} color={MAIN_COLOR_NAMES[3]} />,
      <Tag key={5} text={'Option 5'} color={MAIN_COLOR_NAMES[4]} />,
      <Tag key={6} text={'Option 6'} color={MAIN_COLOR_NAMES[5]} />,
      <Tag key={7} text={'Option 7'} color={MAIN_COLOR_NAMES[6]} />,
    ],
  },
  argTypes: {
    children: { control: false },
    anchorElement: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const Default: Story = {};

export const WithExpandedListBorder: Story = {
  args: { withExpandedListBorder: true },
};

export const WithChipCountDisplay: Story = {
  args: { forceChipCountDisplay: true },
};
