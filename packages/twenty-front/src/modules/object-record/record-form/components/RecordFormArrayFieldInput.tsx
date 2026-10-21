import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemBaseInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';
import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FocusEvent, type KeyboardEvent, useId, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { toSpliced } from '~/utils/array/toSpliced';

const StyledDisplayModeContainer = styled.div<{ readonly?: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  font-family: inherit;
  height: 30px;
  padding-inline: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover,
  &[data-popup-open] {
    background-color: ${({ readonly }) =>
      readonly
        ? 'transparent'
        : themeCssVariables.background.transparent.lighter};
  }
`;

const StyledInputContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholderContainer = styled.div`
  width: 100%;
`;

const NO_ITEM_INDEX = -1;

type RecordFormArrayFieldInputProps = {
  label?: string;
  defaultValue?: FieldArrayValue;
  onChange: (value: FieldArrayValue) => void;
  readonly?: boolean;
  placeholder?: string;
  maxItemCount?: number;
};

export const RecordFormArrayFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  placeholder,
  maxItemCount,
}: RecordFormArrayFieldInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const instanceId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();

  const items = defaultValue ?? [];

  const [firstItemDraft, setFirstItemDraft] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [itemToEditIndex, setItemToEditIndex] = useState(NO_ITEM_INDEX);
  const isAddingNewItem = itemToEditIndex === NO_ITEM_INDEX;

  const dropdownId = `dropdown-${instanceId}`;
  const containerInstanceId = `record-form-array-field-container-${instanceId}`;
  const newItemInputInstanceId = `record-form-array-field-new-item-${instanceId}`;

  const accessibleLabel = isNonEmptyString(label) ? label : t`Items`;
  const isLimitReached =
    isDefined(maxItemCount) && items.length >= maxItemCount;

  const commitFirstItemDraft = () => {
    const sanitizedDraft = firstItemDraft.trim();

    if (isLimitReached || !isNonEmptyString(sanitizedDraft)) {
      return false;
    }

    onChange([...items, sanitizedDraft]);
    setFirstItemDraft('');

    return true;
  };

  const handleRowBlur = (event: FocusEvent<HTMLDivElement>) => {
    const isFocusMovingOutsideRow =
      event.relatedTarget instanceof Node &&
      !event.currentTarget.contains(event.relatedTarget);

    if (isFocusMovingOutsideRow) {
      commitFirstItemDraft();
    }
  };

  const handleFirstItemInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== Key.Enter || event.nativeEvent.isComposing) {
      return;
    }

    event.stopPropagation();

    if (!commitFirstItemDraft()) {
      return;
    }

    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
    removeFocusItemFromFocusStackById({ focusId: containerInstanceId });
  };

  const closeItemInput = () => {
    setIsInputDisplayed(false);
    setInputValue('');
    removeFocusItemFromFocusStackById({ focusId: newItemInputInstanceId });
  };

  const handleEditItem = (index: number) => {
    setInputValue(items[index]);
    setItemToEditIndex(index);
    setIsInputDisplayed(true);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = toSpliced(items, index, 1);

    onChange(updatedItems);

    if (updatedItems.length === 0) {
      closeDropdown(dropdownId);
    }
  };

  const handleNewItemInputFocus = () => {
    pushFocusItemToFocusStack({
      focusId: newItemInputInstanceId,
      component: {
        type: FocusComponentType.FORM_FIELD_INPUT,
        instanceId: newItemInputInstanceId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleNewItemInputSubmit = () => {
    const sanitizedInput = inputValue.trim();

    if (sanitizedInput === '') {
      if (!isAddingNewItem) {
        handleDeleteItem(itemToEditIndex);
      }

      return;
    }

    if (!isAddingNewItem && sanitizedInput === items[itemToEditIndex]) {
      closeItemInput();
      return;
    }

    onChange(
      isAddingNewItem
        ? [...items, sanitizedInput]
        : toSpliced(items, itemToEditIndex, 1, sanitizedInput),
    );
    closeItemInput();
  };

  const handleNewItemInputBlur = (event: FocusEvent<HTMLInputElement>) => {
    const isFocusMovingToAnotherElement = event.relatedTarget instanceof Node;

    if (
      isAddingNewItem &&
      isFocusMovingToAnotherElement &&
      isNonEmptyString(inputValue.trim())
    ) {
      handleNewItemInputSubmit();
      return;
    }

    removeFocusItemFromFocusStackById({ focusId: newItemInputInstanceId });
  };

  const handleNewItemInputEscape = () => {
    closeDropdown(dropdownId);
    closeItemInput();
  };

  const handleAddItemButtonClick = () => {
    if (isLimitReached) {
      return;
    }

    setItemToEditIndex(NO_ITEM_INDEX);
    setIsInputDisplayed(true);
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer onBlur={handleRowBlur}>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={containerInstanceId}
          preventFocusStackUpdate={items.length >= 1}
          hasRightElement={false}
        >
          {readonly ? (
            <StyledDisplayModeContainer readonly>
              {items.length > 0 ? (
                <ArrayDisplay value={items} />
              ) : (
                <StyledPlaceholderContainer>
                  <FormFieldPlaceholder />
                </StyledPlaceholderContainer>
              )}
            </StyledDisplayModeContainer>
          ) : items.length === 0 ? (
            <StyledInputContainer>
              <StyledTextInput
                autoComplete="off"
                placeholder={t`Enter an item`}
                value={firstItemDraft}
                onChange={(event) => setFirstItemDraft(event.target.value)}
                onKeyDown={handleFirstItemInputKeyDown}
              />
            </StyledInputContainer>
          ) : (
            <DropdownRoot dropdownId={dropdownId} type="panel">
              <Dropdown.Trigger
                render={<StyledDisplayModeContainer />}
                nativeButton={false}
                aria-label={accessibleLabel}
              >
                <ArrayDisplay value={items} />
              </Dropdown.Trigger>
              <DropdownContent
                side="bottom"
                align="start"
                sideOffset={parseInt(theme.spacing[1], 10)}
                aria-label={accessibleLabel}
              >
                <Dropdown.Section scrollable>
                  {items.map((item, index) => (
                    <ArrayFieldMenuItem
                      key={index}
                      dropdownId={`record-form-array-field-${instanceId}-${index}`}
                      value={item}
                      onEdit={() => handleEditItem(index)}
                      onDelete={() => handleDeleteItem(index)}
                    />
                  ))}
                </Dropdown.Section>

                <Dropdown.Separator />

                {isInputDisplayed ? (
                  <MultiItemBaseInput
                    instanceId={newItemInputInstanceId}
                    autoFocus
                    placeholder={placeholder}
                    value={inputValue}
                    onFocus={handleNewItemInputFocus}
                    onBlur={handleNewItemInputBlur}
                    onEscape={handleNewItemInputEscape}
                    onChange={setInputValue}
                    onEnter={handleNewItemInputSubmit}
                    hasItem
                  />
                ) : !isLimitReached ? (
                  <Dropdown.Section>
                    <Dropdown.ActionItem
                      onClick={handleAddItemButtonClick}
                      startIcon={<IconPlus />}
                      closeOnClick={false}
                    >{t`Add item`}</Dropdown.ActionItem>
                  </Dropdown.Section>
                ) : null}
              </DropdownContent>
            </DropdownRoot>
          )}
        </FormFieldInputInnerContainer>
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
