import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { arraySchema } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );
  const parseStringArrayToArrayValue = (arrayItems: string[]) => {
    const parseResponse = arraySchema.safeParse(arrayItems);
    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (newValue: any[]) => {
    if (!isDefined(newValue)) setDraftValue(null);

    const nextValue = parseStringArrayToArrayValue(newValue);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleClickOutside = (
    _newValue: any,
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({ newValue: draftValue, event });
  };

  const handleEscape = (newValue: string[]) => {
    onEscape?.({ newValue: parseStringArrayToArrayValue(newValue) });
  };

  const handleEnter = (newValue: string[]) => {
    onEnter?.({ newValue: parseStringArrayToArrayValue(newValue) });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const dropdownId = `array-field-input-${fieldDefinition.metadata.fieldName}`;

  return (
    <MultiItemFieldInput
      dropdownId={`array-field-input-${fieldDefinition.metadata.fieldName}`}
      newItemLabel="Add Item"
      items={arrayItems}
      onChange={handleChange}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder="Enter value"
      fieldMetadataType={FieldMetadataType.ARRAY}
      renderItem={({ value, index, handleEdit, handleDelete }) => (
        <ArrayFieldMenuItem
          key={index}
          dropdownId={dropdownId}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      maxItemCount={maxNumberOfValues}
    ></MultiItemFieldInput>
  );
};
