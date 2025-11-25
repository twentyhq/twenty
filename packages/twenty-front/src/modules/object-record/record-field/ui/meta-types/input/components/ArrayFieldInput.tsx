import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { arraySchema } from '@/object-record/record-field/ui/types/guards/isFieldArrayValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext, useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const ArrayFieldInput = () => {
  const { getLatestDraftValue, setDraftValue, draftValue, fieldDefinition } =
    useArrayField();

  const { onEscape, onClickOutside } = useContext(FieldInputEventContext);
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

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
    const latestDraftValue = getLatestDraftValue(instanceId);
    onClickOutside?.({ newValue: latestDraftValue, event });
  };

  const handleEscape = (_newValue: any) => {
    onEscape?.({ newValue: draftValue });
  };

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

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
      maxItemCount={maxNumberOfValues}
    ></MultiItemFieldInput>
  );
};
