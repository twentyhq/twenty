import { getOperationName } from '@apollo/client/utilities';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import {
  ActivityCreateInput,
  useCreateActivityMutation,
} from '~/generated/graphql';

import { GET_ACTIVITIES } from '../graphql/queries/getActivities';
import { GET_ACTIVITIES_BY_TARGETS } from '../graphql/queries/getActivitiesByTarget';
import { GET_ACTIVITY } from '../graphql/queries/getActivity';
import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { currentActivityState } from '../states/currentActivityState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { getRelationData } from '../utils/getRelationData';

// this hook can be used to create an activity and set other fields (data) at the same time
export const useCreateActivity = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentActivity = useRecoilValue(currentActivityState);
  const [createActivityMutation] = useCreateActivityMutation();

  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);
  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );

  return (data?: Partial<ActivityCreateInput>) => {
    const now = new Date().toISOString();

    return createActivityMutation({
      variables: {
        data: {
          id: currentActivity?.id,
          createdAt: now,
          updatedAt: now,
          author: { connect: { id: currentUser?.id ?? '' } },
          workspaceMemberAuthor: {
            connect: { id: currentUser?.workspaceMember?.id ?? '' },
          },
          workspaceMemberAssignee: {
            connect: { id: currentUser?.workspaceMember?.id ?? '' },
          },
          activityTargets: {
            createMany: {
              data: currentActivity?.targetableEntities
                ? getRelationData(currentActivity.targetableEntities)
                : [],
              skipDuplicates: true,
            },
          },
          type: currentActivity?.type,
          assignee: currentActivity?.assignee,
          ...data,
        },
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITY) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
        getOperationName(GET_ACTIVITIES) ?? '',
      ],
      onCompleted: (data) => {
        setViewableActivityId(data.createOneActivity.id);
        setActivityTargetableEntityArray(
          currentActivity?.targetableEntities ?? [],
        );
      },
    });
  };
};
