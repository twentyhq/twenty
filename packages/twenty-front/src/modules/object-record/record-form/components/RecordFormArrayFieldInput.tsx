import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInlineList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInlineList';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { type MultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemInputTarget';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getInitialMultiItemInlineInputTarget } from '@/object-record/record-field/ui/meta-types/input/utils/getInitialMultiItemInlineInputTarget';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { toSpliced } from '~/utils/array/toSpliced';

const getArrayItemText = (item: string) => item;

type RecordFormArrayFieldInputProps = {
  label?: string;
  defaultValue?: FieldArrayValue | null;
  maxNumberOfValues?: number | null;
  onChange: (value: FieldArrayValue) => void;
};

export const RecordFormArrayFieldInput = ({
  label,
  defaultValue,
  maxNumberOfValues,
  onChange,
}: RecordFormArrayFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxItemCount === 1;

  const [savedItems, setSavedItems] = useState<string[]>(
    () => defaultValue ?? [],
  );
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  const getNextInputTarget = (items: string[]): MultiItemInputTarget =>
    getInitialMultiItemInlineInputTarget({
      itemCount: items.length,
      maxItemCount,
    });

  const {
    inputTarget,
    inputValue,
    openInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: savedItems,
    getItemText: getArrayItemText,
    initialInputTarget: getNextInputTarget(savedItems),
  });

  const editedItemIndex =
    inputTarget.type === 'existing-item' ? inputTarget.itemIndex : null;
  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const getItemsWithInput = (sanitizedInput: string) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: savedItems,
      editingIndex: isSingleItemMode ? 0 : editedItemIndex,
      singleItemMode: isSingleItemMode,
    });

  const saveItems = (items: string[]) => {
    setSavedItems(items);
    onChange(items);
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    onChange(getItemsWithInput(value.trim()));
  };

  const commitInput = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedItems = getItemsWithInput(sanitizedInput);

    saveItems(updatedItems);

    return updatedItems;
  };

  const handleEnter = () => {
    const updatedItems = commitInput();

    if (!isDefined(updatedItems) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openInput(getNextInputTarget(updatedItems));
  };

  const handleEscape = () => {
    saveItems(savedItems);
    openInput(getNextInputTarget(savedItems));
  };

  const handleEdit = (index: number) => {
    if (!isDefined(commitInput())) {
      return;
    }

    setShouldFocusInput(true);
    openInput({ type: 'existing-item', itemIndex: index });
  };

  const handleDelete = (index: number) => {
    const currentItems = commitInput();

    if (!isDefined(currentItems)) {
      return;
    }

    const updatedItems = toSpliced(currentItems, index, 1);

    saveItems(updatedItems);
    openInput(getNextInputTarget(updatedItems));
  };

  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedItems);
  const isInputDisplayed = inputTarget.type !== 'closed';
  const shouldShowInputInFooter = isInputDisplayed && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing = shouldShowItems
    ? 'compact'
    : 'default';

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowItems && shouldShowInputInFooter}
      rightComponent={
        isSingleItemMode ? undefined : (
          <MultiItemFieldSaveButton
            isAddingNewItem={inputTarget.type === 'new-item'}
            onClick={handleEnter}
          />
        )
      }
    >
      <MultiItemFieldTextInput
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={t`Enter value`}
        value={inputValue}
        onChange={handleTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <MultiItemFieldInlineList
        footer={shouldShowInputInFooter ? itemInput : undefined}
      >
        {shouldShowItems
          ? savedItems.map((item, index) =>
              index === editedItemIndex && isEditingItemInPlace ? (
                <MultiItemFieldEditedItem
                  key={index}
                  hasSeparatorBefore={index > 0}
                  hasSeparatorAfter={index < savedItems.length - 1}
                >
                  {itemInput}
                </MultiItemFieldEditedItem>
              ) : (
                <ArrayFieldMenuItem
                  key={index}
                  dropdownId={`${instanceId}-item-${index}`}
                  value={item}
                  onEdit={() => handleEdit(index)}
                  onDelete={() => handleDelete(index)}
                />
              ),
            )
          : undefined}
      </MultiItemFieldInlineList>
    </FormFieldInputContainer>
  );
};
