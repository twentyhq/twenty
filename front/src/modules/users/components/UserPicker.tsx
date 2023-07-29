import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/ui/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { useSearchUserQuery } from '~/generated/graphql';

export type OwnProps = {
  userId: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
  onCancel?: () => void;
};

type UserForSelect = EntityForSelect & {
  entityType: Entity.User;
};

export function UserPicker({ userId, onSubmit, onCancel }: OwnProps) {
  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const users = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    selectedIds: userId ? [userId] : [],
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

  console.log(JSON.stringify({ userId, searchFilter, users }));

  async function handleEntitySelected(
    selectedUser: UserForSelect | null | undefined,
  ) {
    onSubmit(selectedUser ?? null);
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
