import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { GET_COMPANIES } from '@/companies/services';
import { GET_PEOPLE } from '@/people/services';
import { IconTrash } from '@/ui/icons';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { useDeleteCommentThreadMutation } from '~/generated/graphql';

import { GET_COMMENT_THREADS_BY_TARGETS } from '../services';

const StyledContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
`;

type OwnProps = {
  commentThreadId: string;
};

export function CommentThreadActionBar({ commentThreadId }: OwnProps) {
  const theme = useTheme();
  const [createCommentMutation] = useDeleteCommentThreadMutation();
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function deleteCommentThread() {
    createCommentMutation({
      variables: { commentThreadId },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_COMMENT_THREADS_BY_TARGETS) ?? '',
      ],
    });
    setIsRightDrawerOpen(false);
  }

  return (
    <StyledContainer>
      <IconTrash
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.md}
        onClick={deleteCommentThread}
      />
    </StyledContainer>
  );
}
