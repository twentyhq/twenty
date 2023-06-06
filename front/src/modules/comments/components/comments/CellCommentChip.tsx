import styled from '@emotion/styled';

import { CommentChip, CommentChipProps } from './CommentChip';

const StyledCellWrapper = styled.div`
  position: relative;
  right: 34px;
  top: -13px;
  width: 0;
  height: 0;
`;

export function CellCommentChip(props: CommentChipProps) {
  return (
    <StyledCellWrapper>
      <CommentChip {...props} />
    </StyledCellWrapper>
  );
}
