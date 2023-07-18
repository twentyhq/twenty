import styled from '@emotion/styled';

import { CommentChip, CommentChipProps } from './CommentChip';

// TODO: tie those fixed values to the other components in the cell
const StyledCellWrapper = styled.div``;

export function CellCommentChip(props: CommentChipProps) {
  if (props.count === 0) return null;

  return (
    <StyledCellWrapper>
      <CommentChip {...props} />
    </StyledCellWrapper>
  );
}
