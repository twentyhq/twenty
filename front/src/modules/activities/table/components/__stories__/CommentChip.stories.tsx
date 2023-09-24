import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { CommentChip } from '../CommentChip';

const meta: Meta<typeof CommentChip> = {
  title: 'Modules/Comments/CommentChip',
  component: CommentChip,
  decorators: [ComponentDecorator],
  args: { count: 1 },
};

export default meta;
type Story = StoryObj<typeof CommentChip>;

const StyledTestCellContainer = styled.div`
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
      <StyledTestCellContainer>
        <StyledFakeCellText>Fake short text</StyledFakeCellText>
        <Story />
      </StyledTestCellContainer>
    ),
  ],
};

export const InCellOverlappingBlur: Story = {
  ...InCellDefault,
  decorators: [
    (Story) => (
      <StyledTestCellContainer>
        <StyledFakeCellText>
          Fake long text to demonstrate ellipsis
        </StyledFakeCellText>
        <Story />
      </StyledTestCellContainer>
    ),
  ],
};
