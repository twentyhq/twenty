import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFilteredSearchEntityQueryV2 } from '@/search/hooks/useFilteredSearchEntityQueryV2';
import { IconUserCircle } from '@/ui/display/icon';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export type UserPickerProps = {
  userId: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  initialSearchFilter?: string | null;
};

type UserForSelect = EntityForSelect & {
  entityType: Entity.WorkspaceMember;
};

export const UserPicker = ({
  userId,
  onSubmit,
  onCancel,
  width,
  initialSearchFilter,
}: UserPickerProps) => {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const { findManyQuery } = useFindOneObjectMetadataItem({
    objectNamePlural: 'workspaceMembersV2',
  });

  const useFindManyWorkspaceMembers = (options: any) =>
    useQuery(findManyQuery, options);

  const users = useFilteredSearchEntityQueryV2({
    queryHook: useFindManyWorkspaceMembers,
    filters: [
      {
        fieldNames: ['firstName', 'lastName'],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'firstName',
    mappingFunction: (workspaceMember) => ({
      entityType: Entity.WorkspaceMember,
      id: workspaceMember.id,
      name: workspaceMember.firstName,
      avatarType: 'rounded',
      avatarUrl: '',
      originalEntity: workspaceMember,
    }),
    selectedIds: userId ? [userId] : [],
    objectNamePlural: 'workspaceMembersV2',
  });

  const handleEntitySelected = async (selectedUser: any | null | undefined) => {
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
