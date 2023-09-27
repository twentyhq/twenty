import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconUserCircle } from '@/ui/icon';
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

export const UserPicker = ({
  userId,
  onSubmit,
  onCancel,
  width,
}: UserPickerProps) => {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

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
      avatarType: 'rounded',
      avatarUrl: user.avatarUrl ?? '',
      originalEntity: user,
    }),
    selectedIds: userId ? [userId] : [],
  });

  const handleEntitySelected = async (
    selectedUser: UserForSelect | null | undefined,
  ) => {
    onSubmit(selectedUser ?? null);
  };

  return (
    <SingleEntitySelect
      EmptyIcon={IconUserCircle}
      emptyLabel="No Owner"
      entitiesToSelect={users.entitiesToSelect}
      loading={users.loading}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      selectedEntity={users.selectedEntities[0]}
      width={width}
    />
  );
};
