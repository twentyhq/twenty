import { t } from '@lingui/core/macro';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useArrayField } from '@/object-record/record-field/ui/meta-types/hooks/useArrayField';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';
import { useContext, useMemo, useState, useEffect } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { toSpliced } from '~/utils/array/toSpliced';
import { v4 } from 'uuid';

const getExtendedIds = (prevIds: string[], targetLength: number): string[] => {
  if (targetLength <= prevIds.length) {
    return prevIds;
  }

  const idsToAdd = targetLength - prevIds.length;
  const newIds: string[] = [];
  for (let i = 0; i < idsToAdd; i++) {
    newIds.push(v4());
  }

  return [...prevIds, ...newIds];
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

  const [stableIds, setStableIds] = useState<string[]>(() =>
    arrayItems.map(() => v4()),
  );

  useEffect(() => {
    setStableIds((prevIds) => {
      if (arrayItems.length === prevIds.length) {
        return prevIds;
      }
      if (arrayItems.length < prevIds.length) {
        return prevIds.slice(0, arrayItems.length);
      }
      return getExtendedIds(prevIds, arrayItems.length);
    });
  }, [arrayItems.length]);

  const parseStringArrayToArrayValue = (items: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(items);

    if (parseResponse.success) {
      return parseResponse.data;
    }

    return undefined;
  };

  const handleChange = (newValue: string[]) => {
    setStableIds((prevIds) => getExtendedIds(prevIds, newValue.length));

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
          onDelete={() => {
            setStableIds((prevIds) => toSpliced(prevIds, index, 1));
            handleDelete();
          }}
        />
      )}
      maxItemCount={getMaxNumberOfValues()}
    ></MultiItemFieldInput>
  );
};
