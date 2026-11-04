import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { PhonesFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldMenuItem';
import { PhonesFieldPhoneInput } from '@/object-record/record-field/ui/meta-types/input/components/PhonesFieldPhoneInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { formatPhoneInput } from '@/object-record/record-field/ui/meta-types/input/utils/formatPhoneInput';
import { getPhoneText } from '@/object-record/record-field/ui/meta-types/input/utils/getPhoneText';
import { createPhonesFromFieldValue } from '@/object-record/record-field/ui/meta-types/input/utils/phonesUtils';
import { validatePhoneInput } from '@/object-record/record-field/ui/meta-types/input/utils/validatePhoneInput';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import {
  type FieldPhonesValue,
  type PhoneRecord,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { getRecordFormItemIndexAfterSave } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterSave';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type CountryCode } from 'libphonenumber-js';
import { useId, useRef, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

const getPhonesValue = (phones: PhoneRecord[]): FieldPhonesValue => {
  const [primaryPhone, ...additionalPhones] = phones;

  return {
    primaryPhoneNumber: primaryPhone?.number ?? '',
    primaryPhoneCountryCode: primaryPhone?.countryCode ?? '',
    primaryPhoneCallingCode: primaryPhone?.callingCode ?? '',
    additionalPhones,
  };
};

type RecordFormPhonesFieldInputProps = {
  label?: string;
  defaultValue?: FieldPhonesValue;
  defaultCountry?: CountryCode;
  maxNumberOfValues?: number | null;
  placeholder?: string;
  onChange: (value: FieldPhonesValue) => void;
};

export const RecordFormPhonesFieldInput = ({
  label,
  defaultValue,
  defaultCountry,
  maxNumberOfValues,
  placeholder,
  onChange,
}: RecordFormPhonesFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxItemCount === 1;

  const [savedPhones, setSavedPhones] = useState(() =>
    createPhonesFromFieldValue(defaultValue),
  );
  const [shouldFocusInput, setShouldFocusInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInvalidInputLeft, setIsInvalidInputLeft] = useState(false);

  const {
    isInputOpen,
    editedItemIndex,
    inputValue,
    hasError,
    startAddingItem,
    startEditingItem,
    closeInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: savedPhones,
    getItemText: getPhoneText,
    isInputInitiallyOpen: isSingleItemMode || savedPhones.length < maxItemCount,
    initialEditedItemIndex:
      isSingleItemMode && savedPhones.length > 0 ? 0 : null,
    validateInput: validatePhoneInput,
  });

  const openNextInput = (phones: PhoneRecord[]) => {
    if (isSingleItemMode && isNonEmptyArray(phones)) {
      startEditingItem({ itemIndex: 0, currentItems: phones });
      return;
    }

    if (phones.length < maxItemCount) {
      startAddingItem();
      return;
    }

    closeInput();
  };

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;

  const getPhonesWithInput = (sanitizedInput: string) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: savedPhones,
      editingIndex: isSingleItemMode ? 0 : editedItemIndex,
      singleItemMode: isSingleItemMode,
      formatInput: formatPhoneInput,
    });

  const savePhones = (phones: PhoneRecord[]) => {
    setSavedPhones(phones);
    setIsInvalidInputLeft(false);
    setRecordFieldInputIsFieldInError(false);
    onChange(getPhonesValue(phones));
  };

  const isInputValueValid = (value: string) => {
    const sanitizedInput = value.trim();

    return (
      !isNonEmptyString(sanitizedInput) ||
      validatePhoneInput(sanitizedInput).isValid
    );
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    setIsInvalidInputLeft(false);

    const isValid = isInputValueValid(value);

    setRecordFieldInputIsFieldInError(!isValid);
    onChange(
      getPhonesValue(isValid ? getPhonesWithInput(value.trim()) : savedPhones),
    );
  };

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedPhones = getPhonesWithInput(sanitizedInput);

    savePhones(updatedPhones);

    return updatedPhones;
  };

  const handleEnter = () => {
    const updatedPhones = saveInputValue();

    if (!isDefined(updatedPhones) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openNextInput(updatedPhones);
    inputRef.current?.focus();
  };

  const handleEscape = () => {
    savePhones(savedPhones);
    openNextInput(savedPhones);
  };

  const saveInputValueBeforeRowAction = (itemIndex: number) => {
    const updatedPhones = saveInputValue();

    if (!isDefined(updatedPhones)) {
      return null;
    }

    const hasRemovedEditedItem = updatedPhones.length < savedPhones.length;

    return {
      updatedPhones,
      itemIndexAfterSave: getRecordFormItemIndexAfterSave({
        itemIndex,
        removedItemIndex: hasRemovedEditedItem ? editedItemIndex : null,
      }),
    };
  };

  const handleEdit = (index: number) => {
    const saveResult = saveInputValueBeforeRowAction(index);

    if (!isDefined(saveResult)) {
      return;
    }

    setShouldFocusInput(true);
    if (isDefined(saveResult.itemIndexAfterSave)) {
      startEditingItem({
        itemIndex: saveResult.itemIndexAfterSave,
        currentItems: saveResult.updatedPhones,
      });
      return;
    }

    openNextInput(saveResult.updatedPhones);
  };

  const updatePhones = ({
    itemIndex,
    getUpdatedPhones,
  }: {
    itemIndex: number;
    getUpdatedPhones: (params: {
      phones: PhoneRecord[];
      itemIndex: number;
    }) => PhoneRecord[];
  }) => {
    const saveResult = saveInputValueBeforeRowAction(itemIndex);

    if (!isDefined(saveResult)) {
      return;
    }

    const updatedPhones = isDefined(saveResult.itemIndexAfterSave)
      ? getUpdatedPhones({
          phones: saveResult.updatedPhones,
          itemIndex: saveResult.itemIndexAfterSave,
        })
      : saveResult.updatedPhones;

    savePhones(updatedPhones);
    openNextInput(updatedPhones);
  };

  const isInputValueInvalid = hasError || isInvalidInputLeft;
  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedPhones);
  const visiblePhones = shouldShowItems ? savedPhones : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
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
            isAddingNewItem={!isDefined(editedItemIndex)}
            onClick={handleEnter}
          />
        )
      }
    >
      <PhonesFieldPhoneInput
        ref={inputRef}
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={placeholder ?? t`Phone`}
        value={inputValue}
        defaultCountry={defaultCountry}
        onBlur={() => setIsInvalidInputLeft(!isInputValueValid(inputValue))}
        onChange={handleTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <RecordFormMultiItemList
        hasError={isInputValueInvalid}
        footer={shouldShowInputInFooter ? itemInput : undefined}
      >
        {visiblePhones?.map((phone, index) =>
          index === editedItemIndex && isEditingItemInPlace ? (
            <MultiItemFieldEditedItem
              key={index}
              hasSeparatorBefore={index > 0}
              hasSeparatorAfter={index < savedPhones.length - 1}
            >
              {itemInput}
            </MultiItemFieldEditedItem>
          ) : (
            <PhonesFieldMenuItem
              key={index}
              dropdownId={`${instanceId}-phone-${index}`}
              showPrimaryIcon={index === 0 && savedPhones.length > 1}
              showSetAsPrimaryButton={index > 0}
              phone={phone}
              onEdit={() => handleEdit(index)}
              onSetAsPrimary={() =>
                updatePhones({
                  itemIndex: index,
                  getUpdatedPhones: ({ phones, itemIndex }) =>
                    moveArrayItem(phones, { fromIndex: itemIndex, toIndex: 0 }),
                })
              }
              onDelete={() =>
                updatePhones({
                  itemIndex: index,
                  getUpdatedPhones: ({ phones, itemIndex }) =>
                    toSpliced(phones, itemIndex, 1),
                })
              }
            />
          ),
        )}
      </RecordFormMultiItemList>
      {isInputValueInvalid ? (
        <Field.Error match role="alert">
          {t`Enter a valid phone number`}
        </Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
