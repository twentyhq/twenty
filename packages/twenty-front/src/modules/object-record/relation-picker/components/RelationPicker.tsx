import { useContext } from 'react';
import { IconForbid } from 'twenty-ui';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { SearchPickerInitialValueEffect } from '@/object-record/relation-picker/components/SearchPickerInitialValueEffect';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/relation-picker/hooks/useAddNewRecordAndOpenRightDrawer';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

export type RelationPickerProps = {
  selectedRecordId?: string;
  onSubmit: (selectedEntity: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  excludeRecordIds?: string[];
  initialSearchFilter?: string | null;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
};

export const RelationPicker = ({
  selectedRecordId,
  onSubmit,
  onCancel,
  excludeRecordIds,
  width,
  initialSearchFilter,
  fieldDefinition,
}: RelationPickerProps) => {
  const relationPickerScopeId = 'relation-picker';

  const handleEntitySelected = (
    selectedEntity: EntityForSelect | null | undefined,
  ) => onSubmit(selectedEntity ?? null);

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === fieldDefinition.metadata.relationFieldMetadataId,
  );

  const { recordId } = useContext(FieldContext);

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  return (
    <>
      <SearchPickerInitialValueEffect
        initialValueForSearchFilter={initialSearchFilter}
        relationPickerScopeId={relationPickerScopeId}
      />
      <SingleEntitySelect
        EmptyIcon={IconForbid}
        emptyLabel={'No ' + fieldDefinition.label}
        onCancel={onCancel}
        onCreate={createNewRecordAndOpenRightDrawer}
        onEntitySelected={handleEntitySelected}
        width={width}
        relationObjectNameSingular={
          fieldDefinition.metadata.relationObjectMetadataNameSingular
        }
        relationPickerScopeId={relationPickerScopeId}
        selectedRelationRecordIds={selectedRecordId ? [selectedRecordId] : []}
        excludedRelationRecordIds={excludeRecordIds}
      />
    </>
  );
};
