import styled from '@emotion/styled';

import { CommentChip, CommentChipProps } from './CommentChip';

type CellCommentChipProps = CommentChipProps;

// TODO: tie those fixed values to the other components in the cell
const StyledCellWrapper = styled.div``;

export const CellCommentChip = (props: CellCommentChipProps) => {
  if (props.count === 0) return null;

  return (
    <StyledCellWrapper>
      {/* eslint-disable-next-line twenty/no-spread-props */}
      <CommentChip {...props} />
    </StyledCellWrapper>
  );
};
