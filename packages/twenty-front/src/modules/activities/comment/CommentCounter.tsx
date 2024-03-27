import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComment } from 'twenty-ui';

const StyledCommentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const CommentCounter = ({ commentCount }: { commentCount: number }) => {
  const theme = useTheme();
  return (
    <div>
      {commentCount > 0 && (
        <StyledCommentIcon>
          <IconComment size={theme.icon.size.md} />
          {commentCount}
        </StyledCommentIcon>
      )}
    </div>
  );
};

export default CommentCounter;
