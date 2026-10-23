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
import { MultiItemFieldSaveButton } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSaveButton';
import { MultiItemFieldSearchHeader } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldSearchHeader';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { MULTI_ITEM_FIELD_INPUT_DROPDOWN_ID_PREFIX } from '@/object-record/record-field/ui/meta-types/input/constants/MultiItemFieldInputDropdownClickOutsideId';
import { useLinksLabelEditing } from '@/object-record/record-field/ui/meta-types/input/hooks/useLinksLabelEditing';
import { useMultiItemDraft } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemDraft';
import { useMultiItemFieldDismiss } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemFieldDismiss';
import { useMultiItemSearch } from '@/object-record/record-field/ui/meta-types/input/hooks/useMultiItemSearch';
import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getFieldLinkDefinedLinks } from '@/object-record/record-field/ui/meta-types/input/utils/getFieldLinkDefinedLinks';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { type FieldLinksValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { linksFieldValueSchema } from '@/object-record/record-field/ui/validation-schemas/linksFieldValueSchema';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useRef } from 'react';
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
    onSubmit?.({
      newValue: parseArrayToLinksValue(updatedLinks),
      skipClose: true,
    });
  };

  const { labelDraft, setLabelDraft, startEditing, stopEditing, getLinkLabel } =
    useLinksLabelEditing({ links });

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

  const draft = useMultiItemDraft({
    items: links,
    onItemsChange: handleChange,
    getItemText: getLinkText,
    validateInput: validateLink,
    formatInput: ({ input, itemIndex }) => ({
      url: input,
      label: getLinkLabel(itemIndex),
    }),
    maxItemCount: maxNumberOfValues,
    onError: (hasError) =>
      setRecordFieldInputIsFieldInError(hasError && links.length === 0),
  });

  const {
    searchFilter,
    setSearchFilter,
    shouldShowSearch,
    filteredItemEntries,
  } = useMultiItemSearch({ items: links, getItemText: getLinkText });

  const handleInputEnter = () => {
    const updatedItems = draft.commitInput();

    if (!isDefined(updatedItems)) {
      return;
    }

    if (draft.isSingleItemMode) {
      onEnter?.({ newValue: parseArrayToLinksValue(updatedItems) });
    } else if (!isDeeplyEqual(links, updatedItems)) {
      handleSubmit(updatedItems);
    }

    draft.closeInput();
  };

  const handleAddClick = () => {
    if (draft.isLimitReached) {
      return;
    }

    if (draft.isEditingItemInPlace) {
      const updatedItems = draft.commitInput();

      if (!isDefined(updatedItems)) {
        return;
      }

      if (!isDeeplyEqual(links, updatedItems)) {
        handleSubmit(updatedItems);
      }
    }

    draft.startAdding();
  };

  const handleEscape = () => {
    onEscape?.({ newValue: parseArrayToLinksValue(links) });
  };

  useMultiItemFieldDismiss({
    containerRef,
    onEscape: handleEscape,
    onClickOutside: (event) => {
      const updatedItems = draft.isInputDisplayed ? draft.commitInput() : links;

      if (!isDefined(updatedItems)) {
        return;
      }

      onClickOutside?.({
        newValue: parseArrayToLinksValue(updatedItems),
        event,
      });
    },
  });

  const handleEdit = (index: number) => {
    startEditing(index);
    draft.startEditing(index);
  };

  const handleSetAsPrimary = (index: number) => {
    const updatedLinks = moveArrayItem(links, { fromIndex: index, toIndex: 0 });

    stopEditing();
    handleChange(updatedLinks);
    handleSubmit(updatedLinks);
  };

  const handleDelete = (index: number) => {
    const updatedLinks = toSpliced(links, index, 1);

    stopEditing();
    handleChange(updatedLinks);
    handleSubmit(updatedLinks);
    draft.resetInputForItems(updatedLinks);
  };

  const placeholder = isDomainField ? t`Domain` : t`URL`;

  const shouldShowItems =
    isNonEmptyArray(filteredItemEntries) &&
    (!draft.isSingleItemMode || !draft.isInputDisplayed);
  const visibleItemEntries = shouldShowItems ? filteredItemEntries : undefined;
  const visibleItemCount = visibleItemEntries?.length ?? 0;
  const shouldShowInputInFooter =
    draft.isInputDisplayed && !draft.isEditingItemInPlace;
  const shouldShowAddButton = !shouldShowInputInFooter && !draft.isLimitReached;
  const isInputInRow = isNonEmptyArray(links) && !draft.isSingleItemMode;
  const shouldEditLabel = draft.isEditingItemInPlace && !isDomainField;

  const saveButton = isNonEmptyArray(links) ? (
    <MultiItemFieldSaveButton
      isAddingNewItem={draft.isAddingNewItem}
      onClick={handleInputEnter}
    />
  ) : undefined;

  const itemInput = (
    <MultiItemFieldInputRow
      isInRow={isInputInRow}
      isInFooter={shouldShowInputInFooter}
      rightComponent={saveButton}
    >
      <MultiItemFieldTextInput
        autoFocus
        isInRow={isInputInRow}
        placeholder={placeholder}
        value={draft.inputValue}
        hasError={draft.hasError}
        onChange={draft.handleInputChange}
        onEnter={handleInputEnter}
        onEscape={handleEscape}
        shouldPreventTabNavigation
      />
    </MultiItemFieldInputRow>
  );

  const editedLinkInputs = shouldEditLabel ? (
    <>
      <LinksFieldEditPreview
        url={draft.inputValue}
        label={getLinkLabelFromDraft(labelDraft)}
        saveButton={saveButton}
      />
      <MultiItemFieldItemSeparator />
      <LinksFieldEditInputs
        url={draft.inputValue}
        label={labelDraft}
        hasError={draft.hasError}
        onUrlChange={draft.handleInputChange}
        onLabelChange={setLabelDraft}
        onEnter={handleInputEnter}
      />
    </>
  ) : (
    itemInput
  );

  return (
    <OverlayMenuList
      ref={containerRef}
      header={
        shouldShowSearch && !draft.isInputDisplayed ? (
          <MultiItemFieldSearchHeader
            value={searchFilter}
            onChange={setSearchFilter}
          />
        ) : undefined
      }
      footer={
        <>
          {shouldShowItems &&
            (shouldShowInputInFooter || shouldShowAddButton) && (
              <OverlayMenuListSeparator />
            )}
          {shouldShowInputInFooter && itemInput}
          {shouldShowAddButton && (
            <MultiItemFieldAddButton
              label={t`Add ${placeholder}`}
              onClick={handleAddClick}
            />
          )}
        </>
      }
    >
      {visibleItemEntries?.map(({ item: link, index }, position) =>
        draft.isEditingItemInPlace && index === draft.editedItemIndex ? (
          <MultiItemFieldEditedItem
            key={index}
            hasSeparatorBefore={!shouldEditLabel && position > 0}
            hasSeparatorAfter={position < visibleItemCount - 1}
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
    </OverlayMenuList>
  );
};
