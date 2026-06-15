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

const useArrayStableIds = (items: string[]) => {
  const itemsLength = items.length;
  const [stableIds, setStableIds] = useState<string[]>(() => {
    const initialIds: string[] = [];
    for (let i = 0; i < itemsLength; i++) {
      initialIds.push(v4());
    }
    return initialIds;
  });

  const [prevItems, setPrevItems] = useState(items);

  if (prevItems !== items) {
    const diff = itemsLength - prevItems.length;
    if (diff > 0) {
      const newIds: string[] = [];
      for (let i = 0; i < diff; i++) {
        newIds.push(v4());
      }
      setStableIds([...stableIds, ...newIds]);
    } else if (diff < 0) {
      if (itemsLength === 0) {
        setStableIds([]);
      } else {
        let deletedIndex = prevItems.length - 1;
        for (let i = 0; i < itemsLength; i++) {
          if (prevItems[i] !== items[i]) {
            deletedIndex = i;
            break;
          }
        }
        setStableIds(toSpliced(stableIds, deletedIndex, Math.abs(diff)));
      }
    }
    setPrevItems(items);
  }

  return { stableIds, setStableIds };
};

export const ArrayFieldInput = () => {
  const { setDraftValue, draftValue, fieldDefinition } = useArrayField();

  const { onEscape, onClickOutside, onEnter } = useContext(
    FieldInputEventContext,
  );

  const arrayItems = useMemo<Array<string>>(() => {
    if (Array.isArray(draftValue)) {
      return draftValue;
    }
    return [];
  }, [draftValue]);

  const { stableIds, setStableIds } = useArrayStableIds(arrayItems);

  const parseStringArrayToArrayValue = (items: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(items);

    if (parseResponse.success) {
      return parseResponse.data;
    }

    return undefined;
  };

  const handleChange = (newValue: string[]) => {
    if (!isDefined(newValue)) {
      setDraftValue(null);
    }

    const nextValue = parseStringArrayToArrayValue(newValue);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleClickOutside = (
    newValue: string[],
    event: MouseEvent | TouchEvent,
  ) => {
    if (isDefined(onClickOutside)) {
      onClickOutside({
        newValue: parseStringArrayToArrayValue(newValue),
        event,
      });
    }
  };

  const handleEscape = (newValue: string[]) => {
    if (isDefined(onEscape)) {
      onEscape({ newValue: parseStringArrayToArrayValue(newValue) });
    }
  };

  const handleEnter = (newValue: string[]) => {
    if (isDefined(onEnter)) {
      onEnter({ newValue: parseStringArrayToArrayValue(newValue) });
    }
  };

  const getMaxNumberOfValues = () => {
    if (isDefined(fieldDefinition.metadata.settings?.maxNumberOfValues)) {
      return fieldDefinition.metadata.settings.maxNumberOfValues;
    }
    return MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  };

  const getStableId = (index: number) => {
    if (isDefined(stableIds[index])) {
      return stableIds[index];
    }
    return index.toString();
  };

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
          key={getStableId(index)}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${getStableId(index)}`}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      maxItemCount={getMaxNumberOfValues()}
    ></MultiItemFieldInput>
  );
};
