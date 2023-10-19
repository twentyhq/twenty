import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconUserCircle } from '@/ui/display/icon';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useSearchWorkspaceMemberQuery } from '~/generated/graphql';

export type WorkspaceMemberPickerProps = {
  workspaceMemberId: string;
  onSubmit: (newWorkspaceMember: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
};

type WorkspaceMemberForSelect = EntityForSelect & {
  entityType: Entity.WorkspaceMember;
};

export const WorkspaceMemberPicker = ({
  workspaceMemberId,
  onSubmit,
  onCancel,
  width,
}: WorkspaceMemberPickerProps) => {
  const [relationPickerSearchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );

  const users = useFilteredSearchEntityQuery({
    queryHook: useSearchWorkspaceMemberQuery,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: relationPickerSearchFilter,
        relation: 'user',
      },
    ],
    orderByField: 'id',
    mappingFunction: (workspaceMember) => ({
      entityType: Entity.WorkspaceMember,
      id: workspaceMember.id,
      name: workspaceMember.user.displayName,
      avatarType: 'rounded',
      avatarUrl: workspaceMember.user.avatarUrl ?? '',
      originalEntity: workspaceMember,
    }),
    selectedIds: workspaceMemberId ? [workspaceMemberId] : [],
  });

  const handleEntitySelected = async (
    selectedUser: WorkspaceMemberForSelect | null | undefined,
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
