import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { GET_ACTIVITIES } from '@/activities/graphql/queries/getActivities';
import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/graphql/queries/getActivitiesByTarget';
import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { IconButton } from '@/ui/button/components/IconButton';
import { IconTrash } from '@/ui/icon';
import { isRightDrawerOpenState } from '@/ui/right-drawer/states/isRightDrawerOpenState';
import { useDeleteActivityMutation } from '~/generated/graphql';

const StyledContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type OwnProps = {
  activityId: string;
};

export function ActivityActionBar({ activityId }: OwnProps) {
  const theme = useTheme();
  const [deleteActivityMutation] = useDeleteActivityMutation();
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);

  function deleteActivity() {
    deleteActivityMutation({
      variables: { activityId },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
        getOperationName(GET_ACTIVITIES) ?? '',
      ],
    });
    setIsRightDrawerOpen(false);
  }

  return (
    <StyledContainer>
      <IconButton
        icon={
          <IconTrash size={theme.icon.size.sm} stroke={theme.icon.stroke.md} />
        }
        onClick={deleteActivity}
      />
    </StyledContainer>
  );
}
