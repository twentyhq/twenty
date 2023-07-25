import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { GET_COMMENT_THREADS_BY_TARGETS } from '@/activities/queries';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { Button, ButtonVariant } from '@/ui/button/components/Button';
import { IconTrash } from '@/ui/icon';
import { isRightDrawerOpenState } from '@/ui/right-drawer/states/isRightDrawerOpenState';
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
        variant={ButtonVariant.Tertiary}
      />
    </StyledContainer>
  );
}
