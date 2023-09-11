import { useApolloClient } from '@apollo/client';

import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import {
  Activity,
  User,
  useSearchUserQuery,
  useUpdateActivityMutation,
} from '~/generated/graphql';

import { ACTIVITY_UPDATE_FRAGMENT } from '../graphql/fragments/activityUpdateFragment';

export type OwnProps = {
  activity: Pick<Activity, 'id'> & {
    accountOwner?: Pick<User, 'id' | 'displayName'> | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
};

type UserForSelect = EntityForSelect & {
  entityType: Entity.User;
};

export function ActivityAssigneePicker({
  activity,
  onSubmit,
  onCancel,
}: OwnProps) {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updateActivity] = useUpdateActivityMutation();

  const users = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'firstName',
    mappingFunction: (user) => ({
      entityType: Entity.User,
      id: user.id,
      name: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarType: 'rounded',
      avatarUrl: user.avatarUrl ?? '',
    }),
    selectedIds: activity?.accountOwner?.id ? [activity?.accountOwner?.id] : [],
  });

  const client = useApolloClient();
  const cachedActivity = client.readFragment({
    id: `Activity:${activity.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

  function handleEntitySelected(
    selectedUser: UserForSelect | null | undefined,
  ) {
    if (selectedUser) {
      updateActivity({
        variables: {
          where: { id: activity.id },
          data: {
            assignee: { connect: { id: selectedUser.id } },
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateOneActivity: {
            ...cachedActivity,
            assignee: {
              __typename: 'User',
              ...selectedUser,
              displayName: selectedUser.name,
            },
          },
        },
      });
    }

    onSubmit?.();
  }

  return (
    <SingleEntitySelect
      onEntitySelected={handleEntitySelected}
      onCancel={onCancel}
      entities={{
        loading: users.loading,
        entitiesToSelect: users.entitiesToSelect,
        selectedEntity: users.selectedEntities[0],
      }}
    />
  );
}
