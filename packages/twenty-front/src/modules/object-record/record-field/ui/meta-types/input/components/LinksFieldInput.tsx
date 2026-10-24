import { getLinksVariant } from '@/object-record/spreadsheet-import/utils/getLinksVariant';
import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { useLinksField } from '@/object-record/record-field/ui/meta-types/hooks/useLinksField';
import { LinksFieldEditInputs } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditInputs';
import { LinksFieldEditPreview } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldEditPreview';
import { LinksFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/LinksFieldMenuItem';
import { MultiItemFieldAddButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldAddButton';
import { MultiItemFieldEditedItem } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldEditedItem';
import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldItemSeparator } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldItemSeparator';
import { MultiItemFieldList } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldList';
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemInput } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemInput';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { getInitialMultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/utils/getInitialMultiItemInputTarget';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { type MultiItemFieldInputSpacing } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemFieldInputSpacing';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useRef, useState } from 'react';
import { MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES } from 'twenty-shared/constants';
import {
  absoluteUrlSchema,
  isDefined,
  isNonEmptyArray,
  isValidDomain,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const getLinkText = (link: LinkRecord) => link.url;

export const LinksFieldInput = () => {
  const { t } = useLingui();
  const { draftValue, fieldDefinition, setDraftValue } = useLinksField();

  const { onEscape, onClickOutside, onEnter, onSubmit } = useContext(
    FieldInputEventContext,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const links = useMemo<LinkRecord[]>(
    () => getFieldLinkDefinedLinks(draftValue),
    [draftValue],
  );

  const parseArrayToLinksValue = (links: LinkRecord[]) => {
    const nextPrimaryLink = links.at(0);
    const nextSecondaryLinks = links.slice(1);
    const nextValue: FieldLinksValue = {
      primaryLinkUrl: nextPrimaryLink?.url ?? null,
      primaryLinkLabel: nextPrimaryLink?.label ?? null,
      secondaryLinks: nextSecondaryLinks,
    };
    const parseResponse = linksFieldValueSchema.safeParse(nextValue);
    if (parseResponse.success) {
      return parseResponse.data;
    }
  };

  const handleChange = (updatedLinks: LinkRecord[]) => {
    const nextValue = parseArrayToLinksValue(updatedLinks);

    if (isDefined(nextValue)) {
      setDraftValue(nextValue);
    }
  };

  const handleSubmit = (updatedLinks: LinkRecord[]) => {
    if (isDeeplyEqual(links, updatedLinks)) {
      return;
    }

    onSubmit?.({
      newValue: parseArrayToLinksValue(updatedLinks),
      skipClose: true,
    });
  };

  const [labelDraft, setLabelDraft] = useState('');

  const getExistingLinkLabel = (itemIndex?: number) =>
    isDefined(itemIndex) ? (links[itemIndex]?.label ?? null) : null;

  const setRecordFieldInputIsFieldInError = useSetAtomComponentState(
    recordFieldInputIsFieldInErrorComponentState,
  );

  const maxNumberOfValues =
    fieldDefinition.metadata.settings?.maxNumberOfValues ??
    MULTI_ITEM_FIELD_DEFAULT_MAX_VALUES;

  const isDomainField =
    getLinksVariant({
      type: FieldMetadataType.LINKS,
      settings: fieldDefinition.metadata.settings,
    }) === 'domain';

  const validateLink = (input: string) => ({
    isValid: isDomainField
      ? isValidDomain(input)
      : absoluteUrlSchema.safeParse(input).success,
    errorMessage: '',
  });

  const isSingleItemMode = maxNumberOfValues === 1;
  const isLimitReached = links.length >= maxNumberOfValues;

  const {
    inputTarget,
    inputValue,
    hasError,
    openInput,
    handleInputChange,
    validateInputValue,
  } = useMultiItemInput({
    items: links,
    getItemText: getLinkText,
    initialInputTarget: getInitialMultiItemInputTarget({
      itemCount: links.length,
      isSingleItemMode,
    }),
    validateInput: validateLink,
    onHasErrorChange: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && links.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: links, getItemText: getLinkText });

  const isInputDisplayed = inputTarget.type !== 'closed';
  const editedItemIndex =
    inputTarget.type === 'existing-item' ? inputTarget.itemIndex : null;
  const isEditingItemInPlace = isDefined(editedItemIndex) && !isSingleItemMode;
  const shouldEditLabel = isEditingItemInPlace && !isDomainField;

  const closeInput = () => openInput({ type: 'closed' });

  const commitInput = () => {
    const sanitizedInput = validateInputValue();

    if (!isDefined(sanitizedInput)) {
      return null;
    }

    const updatedLinks = computeUpdatedMultiItemFieldItems({
      sanitizedInput,
      items: links,
      editingIndex: editedItemIndex,
      singleItemMode: isSingleItemMode,
      formatInput: ({ input, itemIndex }): LinkRecord => ({
        url: input,
        label: shouldEditLabel
          ? getLinkLabelFromDraft(labelDraft)
          : getExistingLinkLabel(itemIndex),
      }),
    });

    handleChange(updatedLinks);

    return updatedLinks;
  };

  const handleInputEnter = () => {
    const updatedLinks = commitInput();

    if (!isDefined(updatedLinks)) {
      return;
    }

    if (isSingleItemMode) {
      onEnter?.({ newValue: parseArrayToLinksValue(updatedLinks) });
    } else {
      handleSubmit(updatedLinks);
    }

    closeInput();
  };

  const handleAddClick = () => {
    if (isEditingItemInPlace) {
      const updatedLinks = commitInput();

      if (!isDefined(updatedLinks)) {
        return;
      }

      handleSubmit(updatedLinks);
    }

    openInput({ type: 'new-item' });
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseArrayToLinksValue(links) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedLinks = isInputDisplayed ? commitInput() : links;

      if (!isDefined(updatedLinks)) {
        return;
      }

      onClickOutside?.({
        newValue: parseArrayToLinksValue(updatedLinks),
        event,
      });
    },
  });

  const handleEdit = (index: number) => {
    setLabelDraft(links[index]?.label ?? '');
    openInput({ type: 'existing-item', itemIndex: index });
  };

  const handleSetAsPrimary = (index: number) => {
    const updatedLinks = moveArrayItem(links, { fromIndex: index, toIndex: 0 });

    if (isEditingItemInPlace) {
      closeInput();
    }

    handleChange(updatedLinks);
    handleSubmit(updatedLinks);
  };

  const handleDelete = (index: number) => {
    const updatedLinks = toSpliced(links, index, 1);

    handleChange(updatedLinks);
    handleSubmit(updatedLinks);
    openInput(
      isNonEmptyArray(updatedLinks) ? { type: 'closed' } : { type: 'new-item' },
    );
  };

  const placeholder = isDomainField ? t`Domain` : t`URL`;

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!isSingleItemMode || !isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const shouldShowInputInFooter = isInputDisplayed && !isEditingItemInPlace;
  const inputSpacing: MultiItemFieldInputSpacing =
    isNonEmptyArray(links) && !isSingleItemMode ? 'compact' : 'default';

  const saveButton = isNonEmptyArray(links) ? (
    <MultiItemFieldSaveButton
      isAddingNewItem={inputTarget.type === 'new-item'}
      onClick={handleInputEnter}
    />
  ) : undefined;

  const itemInput = (
    <MultiItemFieldInputRow
      spacing={inputSpacing}
      hasPadding={shouldShowInputInFooter && shouldShowItems}
      rightComponent={saveButton}
    >
      <MultiItemFieldTextInput
        autoFocus
        spacing={inputSpacing}
        placeholder={placeholder}
        value={inputValue}
        hasError={hasError}
        onChange={handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        shouldPreventTabNavigation
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
        hasError={hasError}
        onUrlChange={handleInputChange}
        onLabelChange={setLabelDraft}
        onEnter={handleInputEnter}
      />
    </>
  ) : (
    itemInput
  );

  return (
    <MultiItemFieldList
      ref={containerRef}
      hasItems={shouldShowItems}
      shouldShowSearch={shouldShowSearch && !isInputDisplayed}
      searchFilter={searchFilter}
      onSearchFilterChange={setSearchFilter}
      footerInput={shouldShowInputInFooter ? itemInput : undefined}
      addButton={
        !shouldShowInputInFooter && !isLimitReached ? (
          <MultiItemFieldAddButton
            label={t`Add ${placeholder}`}
            onClick={handleAddClick}
          />
        ) : undefined
      }
    >
      {visibleItemEntries?.map(({ item: link, index }, position, entries) =>
        index === editedItemIndex && isEditingItemInPlace ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={!shouldEditLabel && position > 0}
            hasSeparatorAfter={position < entries.length - 1}
          >
            {editedLinkInputs}
          </MultiItemFieldEditedItem>
        ) : (
          <LinksFieldMenuItem
            key={index}
            dropdownId={`${MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX}-${fieldDefinition.metadata.fieldName}-${index}`}
            showPrimaryIcon={index === 0 && links.length > 1}
            showSetAsPrimaryButton={index > 0}
            label={link.label}
            onEdit={() => handleEdit(index)}
            onSetAsPrimary={() => handleSetAsPrimary(index)}
            onDelete={() => handleDelete(index)}
            url={link.url}
          />
        ),
      )}
    </MultiItemFieldList>
  );
};
