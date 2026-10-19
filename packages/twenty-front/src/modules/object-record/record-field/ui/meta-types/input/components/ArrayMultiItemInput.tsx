import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { arrayFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/arrayFieldValueSchema';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ArrayMultiItemInputProps = {
  value: FieldArrayValue | null | undefined;
  fieldName: string;
  maxNumberOfValues?: number | null;
  variant?: FieldInputVariant;
  placeholder?: string;
  onChange: (value: FieldArrayValue) => void;
  onEnter?: (value: FieldArrayValue | null | undefined) => void;
  onEscape?: (value: FieldArrayValue | null | undefined) => void;
  onSubmit?: (value: FieldArrayValue | null | undefined) => void;
  onClickOutside?: (
    value: FieldArrayValue | null | undefined,
    event: MouseEvent | TouchEvent,
  ) => void;
};

export const ArrayMultiItemInput = ({
  value,
  fieldName,
  maxNumberOfValues,
  variant,
  placeholder,
  onChange,
  onEnter,
  onEscape,
  onSubmit,
  onClickOutside,
}: ArrayMultiItemInputProps) => {
  const arrayItems = useMemo<Array<string>>(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  const parseStringArrayToArrayValue = (arrayItems: string[]) => {
    const parseResponse = arrayFieldValueSchema.safeParse(arrayItems);

    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (newValue: string[]) => {
    const nextValue = parseStringArrayToArrayValue(newValue);

    if (isDefined(nextValue)) {
      onChange(nextValue);
    }
  };

  return (
    <MultiItemFieldInput
      variant={variant}
      newItemLabel={t`Add Item`}
      items={arrayItems}
      onChange={handleChange}
      onEnter={(newValue) => onEnter?.(parseStringArrayToArrayValue(newValue))}
      onSubmit={(newValue) =>
        onSubmit?.(parseStringArrayToArrayValue(newValue))
      }
      onEscape={(newValue) =>
        onEscape?.(parseStringArrayToArrayValue(newValue))
      }
      onClickOutside={(newValue, event) =>
        onClickOutside?.(parseStringArrayToArrayValue(newValue), event)
      }
      placeholder={t`Enter value`}
      inputPlaceholder={placeholder}
      fieldMetadataType={FieldMetadataType.ARRAY}
      renderItem={({ value, index, handleEdit, handleDelete }) => (
        <ArrayFieldMenuItem
          key={index}
          dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldName}-${index}`}
          value={value}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      maxItemCount={maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES}
    />
  );
};
