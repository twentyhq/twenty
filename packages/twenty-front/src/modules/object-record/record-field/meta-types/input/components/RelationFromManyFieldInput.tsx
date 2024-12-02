import { useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RelationFromManyFieldInputMultiRecordsEffect } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInputMultiRecordsEffect';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { useAddNewRecordAndOpenRightDrawer } from '@/object-record/relation-picker/hooks/useAddNewRecordAndOpenRightDrawer';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

type RelationFromManyFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const RelationFromManyFieldInput = ({
  onSubmit,
}: RelationFromManyFieldInputProps) => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
  const recordPickerInstanceId = `record-picker-${fieldDefinition.fieldMetadataId}`;
  const { updateRelation } = useUpdateRelationFromManyFieldInput({
    scopeId: recordPickerInstanceId,
  });

  const handleSubmit = () => {
    onSubmit?.(() => {});
  };

  const relationFieldDefinition =
    fieldDefinition as FieldDefinition<FieldRelationMetadata>;

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldDefinition.metadata.relationFieldMetadataId,
  );

  const { createNewRecordAndOpenRightDrawer } =
    useAddNewRecordAndOpenRightDrawer({
      relationObjectMetadataNameSingular:
        relationFieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationObjectMetadataItem,
      relationFieldMetadataItem,
      recordId,
    });

  const { dropdownPlacement } = useDropdown(recordPickerInstanceId);

  return (
    <>
      <RecordPickerComponentInstanceContext.Provider
        value={{ instanceId: recordPickerInstanceId }}
      >
        <RelationFromManyFieldInputMultiRecordsEffect />
        <MultiRecordSelect
          onSubmit={handleSubmit}
          onChange={updateRelation}
          onCreate={createNewRecordAndOpenRightDrawer}
          dropdownPlacement={dropdownPlacement}
        />
      </RecordPickerComponentInstanceContext.Provider>
    </>
  );
};
