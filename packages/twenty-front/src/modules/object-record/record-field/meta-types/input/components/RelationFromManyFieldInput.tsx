import { useContext } from 'react';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { MultiRecordsEffect } from '@/object-record/record-field/meta-types/input/components/MultiRecordsEffect';
import { useUpdateRelationFromManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationFromManyFieldInput';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export type RelationFromManyFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const RelationFromManyFieldInput = ({
  onSubmit,
}: RelationFromManyFieldInputProps) => {
  const { fieldDefinition } = useContext(FieldContext);
  const relationPickerScopeId = `relation-picker-${fieldDefinition.fieldMetadataId}`;
  const { handleChange } = useUpdateRelationFromManyFieldInput({
    scopeId: relationPickerScopeId,
  });

  const handleSubmit = () => {
    onSubmit?.(() => {}); // we persist at change not at submit
  };

  return (
    <>
      <RelationPickerScope relationPickerScopeId={relationPickerScopeId}>
        <ObjectMetadataItemsRelationPickerEffect />
        <MultiRecordsEffect />
        <MultiRecordSelect onSubmit={handleSubmit} onChange={handleChange} />
      </RelationPickerScope>
    </>
  );
};
