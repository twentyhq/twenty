import styled from '@emotion/styled';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
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
    children: Array.from({ length: 7 }, (_, index) => (
      <Tag
        key={index}
        text={`Option ${index + 1}`}
        color={MAIN_COLOR_NAMES[index]}
      />
    )),
    isChipCountDisplayed: false,
  },
  argTypes: {
    children: { control: false },
    anchorElement: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableList>;

export const Default: Story = {};

export const WithChipCount: Story = {
  args: { isChipCountDisplayed: true },
};

export const WithExpandedList: Story = {
  ...WithChipCount,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chipCount = await canvas.findByText('+3');

    await userEvent.click(chipCount);

    expect(await canvas.findByText('Option 7')).toBeDefined();
  },
};

export const WithExpandedListBorder: Story = {
  ...WithExpandedList,
  args: { ...WithExpandedList.args, withExpandedListBorder: true },
};
