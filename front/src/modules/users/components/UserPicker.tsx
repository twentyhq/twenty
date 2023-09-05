import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useSearchUserQuery } from '~/generated/graphql';

export type UserPickerProps = {
  userId: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
};

type UserForSelect = EntityForSelect & {
  entityType: Entity.User;
};

export function UserPicker({
  userId,
  onSubmit,
  onCancel,
  width,
}: UserPickerProps) {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const users = useFilteredSearchEntityQuery({
    queryHook: useSearchUserQuery,
    selectedIds: userId ? [userId] : [],
    searchFilter: relationPickerSearchFilter,
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
    onSubmit(selectedUser ?? null);
  }
  const noUser: UserForSelect = {
    entityType: Entity.User,
    id: '',
    name: 'No Owner',
    avatarType: 'rounded',
    avatarUrl: '',
  };
  return (
    <SingleEntitySelect
      width={width}
      onEntitySelected={handleEntitySelected}
      onCancel={onCancel}
      entities={{
        loading: users.loading,
        entitiesToSelect: users.entitiesToSelect,
        selectedEntity: users.selectedEntities[0],
      }}
      noUser={noUser}
    />
  );
}
