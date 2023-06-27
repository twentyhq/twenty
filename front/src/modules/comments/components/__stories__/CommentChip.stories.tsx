import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { CellCommentChip } from '../CellCommentChip';
import { CommentChip } from '../CommentChip';

const meta: Meta<typeof CellCommentChip> = {
  title: 'Modules/Comments/CellCommentChip',
  component: CellCommentChip,
};

export default meta;
type Story = StoryObj<typeof CellCommentChip>;

const TestCellContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;

  height: fit-content;
  justify-content: flex-start;

  max-width: 250px;
  min-width: 250px;

  overflow: hidden;

  text-wrap: nowrap;
`;

const StyledFakeCellText = styled.div`
  display: flex;
  width: 100%;
`;

export const OneComment: Story = {
  render: getRenderWrapperForComponent(<CommentChip count={1} />),
};

export const TenComments: Story = {
  render: getRenderWrapperForComponent(<CommentChip count={10} />),
};

export const TooManyComments: Story = {
  render: getRenderWrapperForComponent(<CommentChip count={1000} />),
};

export const InCellDefault: Story = {
  render: getRenderWrapperForComponent(
    <TestCellContainer>
      <StyledFakeCellText>Fake short text</StyledFakeCellText>
      <CellCommentChip count={12} />
    </TestCellContainer>,
  ),
};

export const InCellOverlappingBlur: Story = {
  render: getRenderWrapperForComponent(
    <TestCellContainer>
      <StyledFakeCellText>
        Fake long text to demonstrate blur effect
      </StyledFakeCellText>
      <CellCommentChip count={12} />
    </TestCellContainer>,
  ),
};
