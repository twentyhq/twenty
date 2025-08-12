import { FieldInputEventContext } from '@/object-record/record-field/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/meta-types/input/components/MultiItemFieldInput';
import { arraySchema } from '@/object-record/record-field/types/guards/isFieldArrayValue';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside } = useContext(FieldInputEventContext);

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );

  const handleChange = (newValue: any[]) => {
    if (!isDefined(newValue)) setDraftValue(null);

    const parseResponse = arraySchema.safeParse(newValue);

    if (parseResponse.success) {
      setDraftValue(parseResponse.data);
    }
  };

  const handleClickOutside = (
    _newValue: any,
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({ newValue: draftValue, event });
  };

  const handleEscape = (_newValue: any) => {
    onEscape?.({ newValue: draftValue });
  };

  return (
    <MultiItemFieldInput
      newItemLabel="Add Item"
      items={arrayItems}
      onChange={handleChange}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder="Enter value"
      fieldMetadataType={FieldMetadataType.ARRAY}
      renderItem={({ value, index, handleEdit, handleDelete }) => (
        <ArrayFieldMenuItem
          key={index}
          dropdownId={`array-field-input-${fieldDefinition.metadata.fieldName}-${index}`}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    ></MultiItemFieldInput>
  );
};
