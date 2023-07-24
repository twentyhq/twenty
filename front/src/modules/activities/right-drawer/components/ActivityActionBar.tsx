import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/queries';
import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import { Button } from '@/ui/button/components/Button';
import { IconTrash } from '@/ui/icon';
import { isRightDrawerOpenState } from '@/ui/right-drawer/states/isRightDrawerOpenState';
import { useDeleteActivityMutation } from '~/generated/graphql';

const StyledContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
`;

type OwnProps = {
  activityId: string;
};

export function ActivityActionBar({ activityId }: OwnProps) {
  const theme = useTheme();
  const [createCommentMutation] = useDeleteActivityMutation();
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function deleteActivity() {
    createCommentMutation({
      variables: { activityId },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
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
        onClick={deleteActivity}
        variant="tertiary"
      />
    </StyledContainer>
  );
}
