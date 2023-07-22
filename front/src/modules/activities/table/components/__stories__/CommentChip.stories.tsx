import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators';

import { CommentChip } from '../CommentChip';

const meta: Meta<typeof CommentChip> = {
  title: 'Modules/Comments/CommentChip',
  component: CommentChip,
  decorators: [ComponentDecorator],
  args: { count: 1 },
};

export default meta;
type Story = StoryObj<typeof CommentChip>;

const TestCellContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;

  height: fit-content;
  justify-content: space-between;

  max-width: 250px;

  min-width: 250px;

  overflow: hidden;
  text-wrap: nowrap;
`;

const StyledFakeCellText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OneComment: Story = {};

export const TenComments: Story = {
  args: { count: 10 },
};

export const TooManyComments: Story = {
  args: { count: 1000 },
};

export const InCellDefault: Story = {
  args: { count: 12 },
  decorators: [
    (Story) => (
      <TestCellContainer>
        <StyledFakeCellText>Fake short text</StyledFakeCellText>
        <Story />
      </TestCellContainer>
    ),
  ],
};

export const InCellOverlappingBlur: Story = {
  ...InCellDefault,
  decorators: [
    (Story) => (
      <TestCellContainer>
        <StyledFakeCellText>
          Fake long text to demonstrate ellipsis
        </StyledFakeCellText>
        <Story />
      </TestCellContainer>
    ),
  ],
};
