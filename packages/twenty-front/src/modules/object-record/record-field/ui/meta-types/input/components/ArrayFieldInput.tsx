import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';
import { useContext, useMemo, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { toSpliced } from '~/utils/array/toSpliced';
import { v4 } from 'uuid';

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(draftValue) ? draftValue : []),
    [draftValue],
  );

  const [stableIds, setStableIds] = useState<string[]>(() =>
    arrayItems.map(() => v4()),
  );
  const [prevArrayItems, setPrevArrayItems] = useState(arrayItems);

  if (prevArrayItems !== arrayItems) {
    setPrevArrayItems(arrayItems);
    setStableIds((prevIds) => {
      if (arrayItems.length === prevIds.length) {
        return prevIds;
      }
      const newIds = [...prevIds];
      if (arrayItems.length > prevIds.length) {
        for (let i = prevIds.length; i < arrayItems.length; i++) {
          newIds.push(v4());
        }
        return newIds;
      }
      return prevIds.slice(0, arrayItems.length);
    });
  }

  const parseStringArrayToArrayValue = (arrayItems: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(arrayItems);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (newValue: string[]) => {
    setStableIds((prevIds) => {
      if (newValue.length > prevIds.length) {
        const newIds = [...prevIds];
        for (let i = prevIds.length; i < newValue.length; i++) {
          newIds.push(v4());
        }
        return newIds;
      }
      return prevIds;
    });

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
          key={stableIds[index] || index}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${stableIds[index] || index}`}
          value={value}
          onEdit={handleEdit}
          onDelete={() => {
            setStableIds((prevIds) => toSpliced(prevIds, index, 1));
            handleDelete();
          }}
        />
      )}
      maxItemCount={maxNumberOfValues}
    ></MultiItemFieldInput>
  );
};
