import styled from '@emotion/styled';

import { CommentChip, CommentChipProps } from './CommentChip';

// TODO: tie those fixed values to the other components in the cell
const StyledCellWrapper = styled.div`
  position: absolute;
  right: -46px;
  top: 3px;
`;

const StyledCommentChipContainer = styled.div`
  position: relative;
  right: 50px;
  width: 50px;

  display: flex;
  justify-content: flex-end;
`;

export function CellCommentChip(props: CommentChipProps) {
  return (
    <StyledCellWrapper>
      <StyledCommentChipContainer>
        <CommentChip {...props} />
      </StyledCommentChipContainer>
    </StyledCellWrapper>
  );
}
