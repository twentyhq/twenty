import styled from '@emotion/styled';

import { CommentChip, CommentChipProps } from './CommentChip';

type CellCommentChipProps = CommentChipProps;

// TODO: tie those fixed values to the other components in the cell
const StyledCellWrapper = styled.div``;

export const CellCommentChip = ({ count, onClick }: CellCommentChipProps) => {
  if (count === 0) return null;

  return (
    <StyledCellWrapper>
      <CommentChip count={count} onClick={onClick} />
    </StyledCellWrapper>
  );
};
