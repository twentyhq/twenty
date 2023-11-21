import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconUserCircle } from '@/ui/display/icon';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRelationField } from '@/ui/object/field/meta-types/hooks/useRelationField';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export type RelationPickerProps = {
  recordId: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  initialSearchFilter?: string | null;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
};

export const RelationPicker = ({
  recordId,
  onSubmit,
  onCancel,
  width,
  initialSearchFilter,
  fieldDefinition,
}: RelationPickerProps) => {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const { findManyQuery } = useObjectMetadataItem({
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
  });

  const useFindManyQuery = (options: any) => useQuery(findManyQuery, options);

  const { identifiersMapper, searchQuery } = useRelationField();

  const workspaceMembers = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames:
          searchQuery?.filterFields?.(
            fieldDefinition.metadata.objectMetadataNameSingular,
          ) ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (record: any) =>
      identifiersMapper?.(
        record,
        fieldDefinition.metadata.objectMetadataNameSingular,
      ),
    selectedIds: recordId ? [recordId] : [],
    objectNamePlural: fieldDefinition.metadata.objectMetadataNamePlural,
  });

  const handleEntitySelected = async (selectedUser: any | null | undefined) => {
    onSubmit(selectedUser ?? null);
  };

  return (
    <SingleEntitySelect
      EmptyIcon={IconUserCircle}
      emptyLabel="No Owner"
      entitiesToSelect={workspaceMembers.entitiesToSelect}
      loading={workspaceMembers.loading}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      selectedEntity={workspaceMembers.selectedEntities[0]}
      width={width}
    />
  );
};
