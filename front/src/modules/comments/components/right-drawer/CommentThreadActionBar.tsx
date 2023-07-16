import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { GET_COMMENT_THREADS_BY_TARGETS } from '@/comments/services';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/services';
import { Button } from '@/ui/components/buttons/Button';
import { IconTrash } from '@/ui/icons';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { useDeleteCommentThreadMutation } from '~/generated/graphql';

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
      <Button
        icon={
          <IconTrash size={theme.icon.size.sm} stroke={theme.icon.stroke.md} />
        }
        onClick={deleteCommentThread}
        variant="tertiary"
      />
    </StyledContainer>
  );
}
