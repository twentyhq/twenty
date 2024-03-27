import { useEffect } from 'react';
import { IconForbid } from 'twenty-ui';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

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
  const relationPickerScopeId = 'relation-picker';
  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId,
  });

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  const handleEntitySelected = (
    selectedEntity: EntityForSelect | null | undefined,
  ) => onSubmit(selectedEntity ?? null);

  return (
    <SingleEntitySelect
      EmptyIcon={IconForbid}
      emptyLabel={'No ' + fieldDefinition.label}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      width={width}
      relationObjectNameSingular={
        fieldDefinition.metadata.relationObjectMetadataNameSingular
      }
      relationPickerScopeId={relationPickerScopeId}
      selectedRelationRecordIds={recordId ? [recordId] : []}
      excludedRelationRecordIds={excludeRecordIds}
    />
  );
};
