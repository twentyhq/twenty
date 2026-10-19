import { ListItemButton } from 'twenty-ui/components/navigation';
import { MultiItemBaseInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { type MultiItemBaseInputProps } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemBaseInputProps';
import { computeUpdatedMultiItemFieldItems } from '@/object-record/record-field/ui/meta-types/input/utils/computeUpdatedMultiItemFieldItems';
import { sanitizeAndValidateInput } from '@/object-record/record-field/ui/meta-types/input/utils/sanitizeAndValidateInput';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { type PhoneRecord } from '@/object-record/record-field/ui/types/FieldMetadata';
import { StyledFieldInputInlineContainer } from '@/ui/field/input/components/StyledFieldInputInlineContainer';
import { type FieldInputVariant } from '@/ui/field/input/types/FieldInputVariant';
import { OverlayMenuList } from '@/ui/layout/overlay/components/OverlayMenuList';
import { OverlayMenuListSearchRow } from '@/ui/layout/overlay/components/OverlayMenuListSearchRow';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { currentFocusedItemSelector } from '@/ui/utilities/focus/states/currentFocusedItemSelector';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { CustomError, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { LightIconButton } from 'twenty-ui/components/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebounce } from 'use-debounce';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { normalizeSearchText } from 'twenty-ui/utilities';

const StyledAddItemContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledItemInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledInlineItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding: ${themeCssVariables.spacing[1]};
`;

type MultiItemFieldInputProps<T> = {
  items: T[];
  onChange: (newItemsValue: T[]) => void;
  onEscape?: (newItemsValue: T[]) => void;
  onEnter?: (newItemsValue: T[]) => void;
  onSubmit?: (newItemsValue: T[]) => void;
  onClickOutside?: (newItemsValue: T[], event: MouseEvent | TouchEvent) => void;
  onError?: (hasError: boolean, values: any[]) => void;
  placeholder: string;
  inputPlaceholder?: string;
  validateInput?: (input: string) => { isValid: boolean; errorMessage: string };
  formatInput?: (input: string, itemIndex?: number) => T;
  renderItem: (props: {
    value: T;
    index: number;
    handleEdit: () => void;
    handleSetPrimary: () => void;
    handleDelete: () => void;
  }) => React.ReactNode;
  newItemLabel?: string;
  onAddClick?: () => void;
  fieldMetadataType: FieldMetadataType;
  renderInput?: MultiItemBaseInputProps['renderInput'];
  maxItemCount?: number;
  variant?: FieldInputVariant;
};

// TODO: replace renderInput/renderItem/formatInput with a hook exposing them through context.
export const MultiItemFieldInput = <T,>({
  items,
  onChange,
  onEscape,
  onEnter,
  onSubmit,
  onError,
  placeholder,
  inputPlaceholder,
  validateInput,
  formatInput,
  renderItem,
  newItemLabel,
  onAddClick,
  fieldMetadataType,
  renderInput,
  onClickOutside,
  maxItemCount,
  variant = 'floating',
}: MultiItemFieldInputProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInline = variant === 'inline';

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );

  const currentFocusedItem = useAtomStateValue(currentFocusedItemSelector);

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      if (
        currentFocusedItem?.componentInstance.componentType !==
        FocusComponentType.OPENED_FIELD_INPUT
      ) {
        return;
      }

      if (isInputDisplayed) {
        const { isValid, updatedItems } = validateInputAndComputeUpdatedItems();

        if (!isValid) {
          return;
        }

        onChange(updatedItems);
        onClickOutside?.(updatedItems, event);

        return;
      }

      onClickOutside?.(items, event);
    },
    listenerId: instanceId,
    enabled: !isInline,
  });

  const getItemValueAsString = useCallback(
    (index: number): string => {
      if (index >= items.length) {
        return '';
      }

      let item;
      switch (fieldMetadataType) {
        case FieldMetadataType.LINKS:
          item = items[index] as { label: string; url: string };
          return item.url || '';
        case FieldMetadataType.PHONES:
          item = items[index] as PhoneRecord;
          return item.callingCode + item.number;
        case FieldMetadataType.EMAILS:
          item = items[index] as string;
          return item;
        case FieldMetadataType.ARRAY:
          item = items[index] as string;
          return item;
        case FieldMetadataType.FILES:
          item = items[index] as { label: string };
          return item.label || '';
        default:
          throw new CustomError(
            doNotTranslate(`Unsupported field type: ${fieldMetadataType}`),
            'UNSUPPORTED_FIELD_TYPE',
          );
      }
    },
    [items, fieldMetadataType],
  );

  const shouldAutoEnterBecauseOnlyOneItemIsAllowed = maxItemCount === 1;
  const shouldAutoEditFirstItemOnOpen =
    items.length === 0 || maxItemCount === 1;

  const [isInputDisplayed, setIsInputDisplayed] = useState(
    shouldAutoEditFirstItemOnOpen && !isDefined(onAddClick),
  );

  const [inputValue, setInputValue] = useState(
    shouldAutoEditFirstItemOnOpen && !isDefined(onAddClick)
      ? getItemValueAsString(0)
      : '',
  );

  const [itemToEditIndex, setItemToEditIndex] = useState(0);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [itemsBeforeInlineInput, setItemsBeforeInlineInput] = useState<
    T[] | null
  >(isInline && isInputDisplayed ? items : null);

  const baselineItems = itemsBeforeInlineInput ?? items;

  const [errorData, setErrorData] = useState({
    isValid: true,
    errorMessage: '',
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [debouncedSearchFilter] = useDebounce(searchFilter, 150);

  const shouldShowSearch = items.length > 3;

  const filteredItems = useMemo(() => {
    if (!shouldShowSearch || !debouncedSearchFilter) {
      return baselineItems;
    }
    const searchTerm = normalizeSearchText(debouncedSearchFilter);
    return baselineItems.filter((_item, index) => {
      const itemText = getItemValueAsString(index);
      return normalizeSearchText(itemText).includes(searchTerm);
    });
  }, [
    baselineItems,
    debouncedSearchFilter,
    shouldShowSearch,
    getItemValueAsString,
  ]);

  const isLimitReached =
    typeof maxItemCount === 'number' && items.length >= maxItemCount;

  const isEditingItemInPlace =
    isInputDisplayed &&
    !isAddingNewItem &&
    !shouldAutoEnterBecauseOnlyOneItemIsAllowed &&
    itemToEditIndex < baselineItems.length;

  const computeItemsWithInputValue = (value: string) =>
    computeUpdatedMultiItemFieldItems({
      sanitizedInput: value.trim(),
      items: baselineItems,
      editingIndex: isAddingNewItem ? null : itemToEditIndex,
      singleItemMode: shouldAutoEnterBecauseOnlyOneItemIsAllowed,
      formatInput,
    });

  const snapshotItemsBeforeInlineInput = () => {
    setItemsBeforeInlineInput(items);
  };

  const closeInlineInput = (remainingItems: T[]) => {
    const shouldKeepEmptyInput =
      remainingItems.length === 0 && !isDefined(onAddClick);

    setIsInputDisplayed(shouldKeepEmptyInput);
    setIsAddingNewItem(false);
    setItemToEditIndex(0);
    setInputValue('');
    setItemsBeforeInlineInput(shouldKeepEmptyInput ? [] : null);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (isInline) {
      onChange(computeItemsWithInputValue(value));
    }

    if (!validateInput) return;

    setErrorData(
      errorData.isValid ? errorData : { isValid: true, errorMessage: '' },
    );

    onError?.(false, items);
  };

  const handleAddButtonClick = () => {
    if (isLimitReached) {
      return;
    }

    if (isInline) {
      if (isInputDisplayed && !validateInputAndComputeUpdatedItems().isValid) {
        return;
      }

      snapshotItemsBeforeInlineInput();
      setIsAddingNewItem(true);
      setInputValue('');
      setIsInputDisplayed(true);
      return;
    }

    if (isEditingItemInPlace) {
      const { isValid, updatedItems } = validateInputAndComputeUpdatedItems();

      if (!isValid) {
        return;
      }

      onChange(updatedItems);

      if (!isDeeplyEqual(items, updatedItems)) {
        onSubmit?.(updatedItems);
      }
    }

    if (isDefined(onAddClick)) {
      setIsInputDisplayed(false);
      setInputValue('');
      onAddClick();
      return;
    }

    setIsAddingNewItem(true);
    setInputValue('');
    setIsInputDisplayed(true);
  };

  const handleEditButtonClick = (index: number) => {
    if (isInline) {
      snapshotItemsBeforeInlineInput();
    }

    setItemToEditIndex(index);
    setInputValue(getItemValueAsString(index));
    setIsAddingNewItem(false);
    setIsInputDisplayed(true);
  };

  const handleEnter = () => {
    const { isValid, updatedItems } = validateInputAndComputeUpdatedItems();
    if (!isValid) {
      return;
    }

    onChange(updatedItems);

    if (isInline) {
      closeInlineInput(updatedItems);
      return;
    }

    if (shouldAutoEnterBecauseOnlyOneItemIsAllowed) {
      onEnter?.(updatedItems);
    } else if (!isDeeplyEqual(items, updatedItems)) {
      onSubmit?.(updatedItems);
    }

    setIsInputDisplayed(false);
    setIsAddingNewItem(false);
    setInputValue('');
  };

  const showInputIfNoItemsRemain = (remainingItems: T[]) => {
    const shouldShowInput =
      remainingItems.length === 0 && !isDefined(onAddClick);
    setIsInputDisplayed(shouldShowInput);
    setIsAddingNewItem(false);
    if (shouldShowInput) {
      setInputValue('');
    }
  };

  const validateInputAndComputeUpdatedItems = (): {
    isValid: boolean;
    updatedItems: T[];
  } => {
    const { sanitizedInput, isValid, errorMessage } = sanitizeAndValidateInput(
      inputValue,
      validateInput,
    );

    if (!isValid) {
      onError?.(true, items);
      setErrorData({ isValid: false, errorMessage });
      return { isValid: false, updatedItems: items };
    }

    const editingIndex = isAddingNewItem ? null : itemToEditIndex;

    const updatedItems = computeItemsWithInputValue(sanitizedInput);

    const isItemDeletion =
      !isNonEmptyString(sanitizedInput) &&
      isDefined(editingIndex) &&
      !shouldAutoEnterBecauseOnlyOneItemIsAllowed;

    if (isItemDeletion && !isInline) {
      showInputIfNoItemsRemain(updatedItems);
    }

    return { isValid: true, updatedItems };
  };

  const handleSetPrimaryItem = (index: number) => {
    const updatedItems = moveArrayItem(items, { fromIndex: index, toIndex: 0 });
    onChange(updatedItems);

    if (isInline) {
      closeInlineInput(updatedItems);
      return;
    }

    onSubmit?.(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = toSpliced(items, index, 1);
    onChange(updatedItems);

    if (isInline) {
      closeInlineInput(updatedItems);
      return;
    }

    onSubmit?.(updatedItems);
    showInputIfNoItemsRemain(updatedItems);
  };

  const handleEscape = () => {
    if (isInline) {
      onChange(baselineItems);
      closeInlineInput(baselineItems);
      return;
    }

    onEscape?.(items);
  };

  useHotkeysOnFocusedElement({
    focusId: instanceId,
    keys: [Key.Escape],
    callback: handleEscape,
    dependencies: [handleEscape],
  });

  const shouldShowItems =
    isNonEmptyArray(filteredItems) &&
    (!shouldAutoEnterBecauseOnlyOneItemIsAllowed || !isInputDisplayed);

  const shouldShowInputInFooter = isInputDisplayed && !isEditingItemInPlace;
  const shouldShowAddButton = !shouldShowInputInFooter && !isLimitReached;

  const itemInput = (
    <MultiItemBaseInput
      instanceId={instanceId}
      autoFocus={
        isInline
          ? isEditingItemInPlace || isAddingNewItem
          : isEditingItemInPlace || !shouldShowSearch
      }
      placeholder={inputPlaceholder ?? placeholder}
      value={inputValue}
      hasError={!errorData.isValid}
      renderInput={renderInput}
      onEscape={handleEscape}
      onChange={(value) =>
        handleInputChange(
          isNonEmptyString(value)
            ? turnIntoEmptyStringIfWhitespacesOnly(value)
            : '',
        )
      }
      onEnter={handleEnter}
      preventTabNavigation={!isInline}
      hasItem={isNonEmptyArray(baselineItems)}
      rightComponent={
        isNonEmptyArray(baselineItems) ? (
          <LightIconButton
            onClick={handleEnter}
            aria-label={isAddingNewItem ? t`Add item` : t`Save item`}
          >
            {isAddingNewItem ? <IconPlus /> : <IconCheck />}
          </LightIconButton>
        ) : null
      }
    />
  );

  const header =
    shouldShowSearch && !isInputDisplayed ? (
      <>
        <OverlayMenuListSearchRow
          value={searchFilter}
          onChange={(event) =>
            setSearchFilter(
              turnIntoEmptyStringIfWhitespacesOnly(event.currentTarget.value),
            )
          }
        />
        <OverlayMenuListSeparator />
      </>
    ) : undefined;

  const footer = (
    <>
      {shouldShowItems && (shouldShowInputInFooter || shouldShowAddButton) && (
        <OverlayMenuListSeparator />
      )}
      {shouldShowInputInFooter ? (
        itemInput
      ) : shouldShowAddButton ? (
        <StyledAddItemContainer>
          <ListItemButton
            onClick={handleAddButtonClick}
            startIcon={<IconPlus />}
          >
            <OverflowingTextWithTooltip
              text={newItemLabel || t`Add ${placeholder}`}
            />
          </ListItemButton>
        </StyledAddItemContainer>
      ) : null}
    </>
  );

  const renderedItems = shouldShowItems
    ? filteredItems.map((item) => {
        const originalIndex = baselineItems.indexOf(item);

        if (isEditingItemInPlace && originalIndex === itemToEditIndex) {
          return (
            <StyledItemInputContainer key={`item-input-${originalIndex}`}>
              {itemInput}
            </StyledItemInputContainer>
          );
        }

        return renderItem({
          value: item,
          index: originalIndex,
          handleEdit: () => handleEditButtonClick(originalIndex),
          handleSetPrimary: () => handleSetPrimaryItem(originalIndex),
          handleDelete: () => handleDeleteItem(originalIndex),
        });
      })
    : undefined;

  if (isInline) {
    return (
      <StyledFieldInputInlineContainer ref={containerRef}>
        {header}
        {isDefined(renderedItems) && (
          <StyledInlineItems>{renderedItems}</StyledInlineItems>
        )}
        {footer}
      </StyledFieldInputInlineContainer>
    );
  }

  return (
    <OverlayMenuList ref={containerRef} header={header} footer={footer}>
      {renderedItems}
    </OverlayMenuList>
  );
};
