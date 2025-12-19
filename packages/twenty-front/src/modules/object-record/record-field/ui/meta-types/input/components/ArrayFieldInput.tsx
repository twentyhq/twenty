import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
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

  const handleChange = (newValue: string[]) => {
    if (!isDefined(newValue)) setDraftValue(null);

    const nextValue = parseStringArrayToArrayValue(newValue);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleClickOutside = (
    newValue: string[],
    event: MouseEvent | TouchEvent,
  ) => {
    onClickOutside?.({
      newValue: parseStringArrayToArrayValue(newValue),
      event,
    });
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

  return (
    <MultiItemFieldInput
      newItemLabel={t`Add Item`}
      items={arrayItems}
      onChange={handleChange}
      onEnter={handleEnter}
      onEscape={handleEscape}
      onClickOutside={handleClickOutside}
      placeholder={t`Enter value`}
      fieldMetadataType={FieldMetadataType.ARRAY}
      renderItem={({ value, index, handleEdit, handleDelete }) => (
        <ArrayFieldMenuItem
          key={index}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      maxItemCount={maxNumberOfValues}
    ></MultiItemFieldInput>
  );
};
