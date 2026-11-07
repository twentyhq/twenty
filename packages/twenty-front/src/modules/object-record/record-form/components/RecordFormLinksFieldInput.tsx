import { LinksFieldDomainFavicon } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldDomainFavicon';
import { LinksFieldEditInputs } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditInputs';
import { LinksFieldEditPreview } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditPreview';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldItemSeparator } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldItemSeparator';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { validateLinkInput } from '@/object-record/record-field/ui/meta-types/input/utils/validateLinkInput';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RecordFormMultiItemList } from '@/object-record/record-form/components/RecordFormMultiItemList';
import { getRecordFormItemIndexAfterSave } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterSave';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

const getLinkText = (link: LinkRecord) => link.url;

const getLinksValue = (links: LinkRecord[]): FieldLinksValue => {
  const [primaryLink, ...secondaryLinks] = links;

  return {
    primaryLinkUrl: primaryLink?.url ?? null,
    primaryLinkLabel: primaryLink?.label ?? null,
    secondaryLinks,
  };
};

type RecordFormLinksFieldInputProps = {
  label?: string;
  defaultValue?: FieldLinksValue;
  isDomainField: boolean;
  maxNumberOfValues?: number | null;
  placeholder?: string;
  onChange: (value: FieldLinksValue) => void;
};

export const RecordFormLinksFieldInput = ({
  label,
  defaultValue,
  isDomainField,
  maxNumberOfValues,
  placeholder,
  onChange,
}: RecordFormLinksFieldInputProps) => {
  const { t } = useLingui();
  const instanceId = useId();

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const maxItemCount = maxNumberOfValues ?? MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;
  const isSingleItemMode = maxItemCount === 1;

  const validateLink = (input: string) =>
    validateLinkInput({ input, isDomainField });

  const [savedLinks, setSavedLinks] = useState(() =>
    getFieldLinkDefinedLinks(defaultValue),
  );
  const [labelDraft, setLabelDraft] = useState('');
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
    items: savedLinks,
    getItemText: getLinkText,
    isInputInitiallyOpen: isSingleItemMode || savedLinks.length < maxItemCount,
    initialEditedItemIndex:
      isSingleItemMode && savedLinks.length > 0 ? 0 : null,
    validateInput: validateLink,
  });

  const openNextInput = (links: LinkRecord[]) => {
    if (isSingleItemMode && isNonEmptyArray(links)) {
      startEditingItem({ itemIndex: 0, currentItems: links });
      return;
    }

    if (links.length < maxItemCount) {
      startAddingItem();
      return;
    }

    closeInput();
  };

  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;
  const shouldEditLabel = isEditingItemInPlace && !isDomainField;

  const getLinkLabel = ({
    itemIndex,
    labelInput,
  }: {
    itemIndex?: number;
    labelInput: string;
  }) => {
    if (shouldEditLabel) {
      return getLinkLabelFromDraft(labelInput);
    }

    return isDefined(itemIndex) ? (savedLinks[itemIndex]?.label ?? null) : null;
  };

  const getLinksWithInput = ({
    sanitizedInput,
    labelInput,
  }: {
    sanitizedInput: string;
    labelInput: string;
  }) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: savedLinks,
      editingIndex: isSingleItemMode ? 0 : editedItemIndex,
      singleItemMode: isSingleItemMode,
      formatInput: ({ input, itemIndex }): LinkRecord => ({
        url: input,
        label: getLinkLabel({ itemIndex, labelInput }),
      }),
    });

  const saveLinks = (links: LinkRecord[]) => {
    setSavedLinks(links);
    setIsInvalidInputLeft(false);
    setRecordFieldInputIsFieldInError(false);
    onChange(getLinksValue(links));
  };

  const isInputValueValid = (value: string) => {
    const sanitizedInput = value.trim();

    return (
      !isNonEmptyString(sanitizedInput) || validateLink(sanitizedInput).isValid
    );
  };

  const sendLinksWithInput = ({
    urlInput,
    labelInput,
  }: {
    urlInput: string;
    labelInput: string;
  }) => {
    const isValid = isInputValueValid(urlInput);

    setRecordFieldInputIsFieldInError(!isValid);
    onChange(
      getLinksValue(
        isValid
          ? getLinksWithInput({ sanitizedInput: urlInput.trim(), labelInput })
          : savedLinks,
      ),
    );
  };

  const handleTyping = (value: string) => {
    handleInputChange(value);
    setIsInvalidInputLeft(false);
    sendLinksWithInput({ urlInput: value, labelInput: labelDraft });
  };

  const handleLabelTyping = (value: string) => {
    setLabelDraft(value);
    sendLinksWithInput({ urlInput: inputValue, labelInput: value });
  };

  const saveInputValue = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedLinks = getLinksWithInput({
      sanitizedInput,
      labelInput: labelDraft,
    });

    saveLinks(updatedLinks);

    return updatedLinks;
  };

  const handleEnter = () => {
    const updatedLinks = saveInputValue();

    if (!isDefined(updatedLinks) || isSingleItemMode) {
      return;
    }

    setShouldFocusInput(true);
    openNextInput(updatedLinks);
    inputRef.current?.focus();
  };

  const handleEscape = () => {
    saveLinks(savedLinks);
    openNextInput(savedLinks);
  };

  const saveInputValueBeforeRowAction = (itemIndex: number) => {
    const updatedLinks = saveInputValue();

    if (!isDefined(updatedLinks)) {
      return null;
    }

    const hasRemovedEditedItem = updatedLinks.length < savedLinks.length;

    return {
      updatedLinks,
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
      setLabelDraft(
        saveResult.updatedLinks[saveResult.itemIndexAfterSave]?.label ?? '',
      );
      startEditingItem({
        itemIndex: saveResult.itemIndexAfterSave,
        currentItems: saveResult.updatedLinks,
      });
      return;
    }

    openNextInput(saveResult.updatedLinks);
  };

  const updateLinks = ({
    itemIndex,
    getUpdatedLinks,
  }: {
    itemIndex: number;
    getUpdatedLinks: (params: {
      links: LinkRecord[];
      itemIndex: number;
    }) => LinkRecord[];
  }) => {
    const saveResult = saveInputValueBeforeRowAction(itemIndex);

    if (!isDefined(saveResult)) {
      return;
    }

    const updatedLinks = isDefined(saveResult.itemIndexAfterSave)
      ? getUpdatedLinks({
          links: saveResult.updatedLinks,
          itemIndex: saveResult.itemIndexAfterSave,
        })
      : saveResult.updatedLinks;

    saveLinks(updatedLinks);
    openNextInput(updatedLinks);
  };

  const inputPlaceholder = isDomainField ? t`Domain` : t`URL`;
  const isInputValueInvalid = hasError || isInvalidInputLeft;
  const shouldShowItems = !isSingleItemMode && isNonEmptyArray(savedLinks);
  const visibleLinks = shouldShowItems ? savedLinks : undefined;
  const shouldShowInputInFooter = isInputOpen && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing = shouldShowItems
    ? 'compact'
    : 'default';

  const saveButton = isSingleItemMode ? undefined : (
    <MultiItemFieldSaveButton
      isAddingNewItem={!isDefined(editedItemIndex)}
      onClick={handleEnter}
    />
  );

  const handleInputBlur = () =>
    setIsInvalidInputLeft(!isInputValueValid(inputValue));

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowItems && shouldShowInputInFooter}
      rightComponent={saveButton}
    >
      {isDomainField && <LinksFieldDomainFavicon domain={inputValue} />}
      <MultiItemFieldTextInput
        ref={inputRef}
        autoFocus={shouldFocusInput}
        spacing={inputSpacing}
        placeholder={placeholder ?? inputPlaceholder}
        value={inputValue}
        onBlur={handleInputBlur}
        onChange={handleTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
      />
    </MultiItemFieldInputRow>
  );

  const editedLinkInputs = shouldEditLabel ? (
    <>
      <LinksFieldEditPreview
        url={inputValue}
        label={getLinkLabelFromDraft(labelDraft)}
        saveButton={saveButton}
      />
      <MultiItemFieldItemSeparator />
      <LinksFieldEditInputs
        url={inputValue}
        label={labelDraft}
        hasError={isInputValueInvalid}
        onUrlChange={handleTyping}
        onLabelChange={handleLabelTyping}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onUrlBlur={handleInputBlur}
      />
    </>
  ) : (
    itemInput
  );

  return (
    <FormFieldInputContainer>
      {isNonEmptyString(label) ? <Field.Label>{label}</Field.Label> : null}
      <RecordFormMultiItemList
        hasError={isInputValueInvalid}
        footer={shouldShowInputInFooter ? itemInput : undefined}
      >
        {visibleLinks?.map((link, index) =>
          index === editedItemIndex && isEditingItemInPlace ? (
            <MultiItemFieldEditedItem
              key={index}
              hasSeparatorBefore={!shouldEditLabel && index > 0}
              hasSeparatorAfter={index < savedLinks.length - 1}
            >
              {editedLinkInputs}
            </MultiItemFieldEditedItem>
          ) : (
            <LinksFieldMenuItem
              key={index}
              dropdownId={`${instanceId}-link-${index}`}
              showPrimaryIcon={index === 0 && savedLinks.length > 1}
              showSetAsPrimaryButton={index > 0}
              url={link.url}
              label={link.label}
              onEdit={() => handleEdit(index)}
              onSetAsPrimary={() =>
                updateLinks({
                  itemIndex: index,
                  getUpdatedLinks: ({ links, itemIndex }) =>
                    moveArrayItem(links, { fromIndex: itemIndex, toIndex: 0 }),
                })
              }
              onDelete={() =>
                updateLinks({
                  itemIndex: index,
                  getUpdatedLinks: ({ links, itemIndex }) =>
                    toSpliced(links, itemIndex, 1),
                })
              }
            />
          ),
        )}
      </RecordFormMultiItemList>
      {isInputValueInvalid ? (
        <Field.Error match role="alert">
          {isDomainField ? t`Enter a valid domain` : t`Enter a valid URL`}
        </Field.Error>
      ) : null}
    </FormFieldInputContainer>
  );
};
