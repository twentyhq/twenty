import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState } from 'recoil';

import { GET_ACTIVITIES } from '@/activities/graphql/queries/getActivities';
import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/graphql/queries/getActivitiesByTarget';
import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { LightIconButton } from '@/ui/button/components/LightIconButton';
import { IconTrash } from '@/ui/icon';
import { isRightDrawerOpenState } from '@/ui/right-drawer/states/isRightDrawerOpenState';
import { useDeleteActivityMutation } from '~/generated/graphql';

type OwnProps = {
  activityId: string;
};

export function ActivityActionBar({ activityId }: OwnProps) {
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
    <LightIconButton
      Icon={IconTrash}
      onClick={deleteActivity}
      accent="tertiary"
      size="medium"
    />
  );
}
