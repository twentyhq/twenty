import { useEffect } from 'react';

import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { FieldDefinition } from '@/object-record/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/object-record/field/types/FieldMetadata';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconForbid } from '@/ui/display/icon';

export type RelationPickerProps = {
  recordId?: string;
  onSubmit: (selectedEntity: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  excludeRecordIds?: string[];
  initialSearchFilter?: string | null;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
};

export const RelationPicker = ({
  recordId,
  onSubmit,
  onCancel,
  excludeRecordIds,
  width,
  initialSearchFilter,
  fieldDefinition,
}: RelationPickerProps) => {
  const {
    relationPickerSearchFilter,
    setRelationPickerSearchFilter,
    identifiersMapper,
    searchQuery,
  } = useRelationPicker({ relationPickerScopeId: 'relation-picker' });

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const { objectNameSingular: relationObjectNameSingular } =
    useObjectNameSingularFromPlural({
      objectNamePlural:
        fieldDefinition.metadata.relationObjectMetadataNamePlural,
    });

  const entities = useFilteredSearchEntityQuery({
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          ) ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (record: any) =>
      identifiersMapper?.(
        record,
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      ),
    selectedIds: recordId ? [recordId] : [],
    excludeEntityIds: excludeRecordIds,
    objectNameSingular: relationObjectNameSingular,
  });

  const handleEntitySelected = (selectedEntity: any | null | undefined) =>
    onSubmit(selectedEntity ?? null);

  return (
    <SingleEntitySelect
      EmptyIcon={IconForbid}
      emptyLabel={'No ' + fieldDefinition.label}
      entitiesToSelect={entities.entitiesToSelect}
      loading={entities.loading}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      selectedEntity={entities.selectedEntities[0]}
      width={width}
    />
  );
};
