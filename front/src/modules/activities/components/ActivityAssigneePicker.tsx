import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/ui/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  Activity,
  User,
  useSearchUserQuery,
  useUpdateActivityMutation,
} from '~/generated/graphql';

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
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updateActivity] = useUpdateActivityMutation();

  const companies = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    selectedIds: activity?.accountOwner?.id ? [activity?.accountOwner?.id] : [],
    searchFilter: searchFilter,
    mappingFunction: (user) => ({
      entityType: Entity.User,
      id: user.id,
      name: user.displayName,
      avatarType: 'rounded',
      avatarUrl: user.avatarUrl ?? '',
    }),
    orderByField: 'firstName',
    searchOnFields: ['firstName', 'lastName'],
  });

  async function handleEntitySelected(
    selectedUser: UserForSelect | null | undefined,
  ) {
    if (selectedUser) {
      await updateActivity({
        variables: {
          where: { id: activity.id },
          data: {
            assignee: { connect: { id: selectedUser.id } },
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
        loading: companies.loading,
        entitiesToSelect: companies.entitiesToSelect,
        selectedEntity: companies.selectedEntities[0],
      }}
    />
  );
}
