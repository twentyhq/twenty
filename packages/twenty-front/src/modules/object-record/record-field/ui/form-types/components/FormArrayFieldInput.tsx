import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { MultiItemBaseInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemBaseInput';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { toSpliced } from '~/utils/array/toSpliced';

type FormArrayFieldInputProps = {
  label?: string;
  defaultValue: FieldArrayValue | string | undefined;
  onChange: (value: FieldArrayValue | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  testId?: string;
};

const StyledDisplayModeReadonlyContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledDisplayModeContainer = styled(StyledDisplayModeReadonlyContainer)`
  height: 30px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

const StyledPlaceholder = styled(FormFieldPlaceholder)`
  width: 100%;
`;

const parseSpacingValueAsNumber = (value: string) => {
  return Number(value.replace('px', ''));
};

export const FormArrayFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  testId,
}: FormArrayFieldInputProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const instanceId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldArrayValue;
      }
    | {
        type: 'variable';
        value: string;
      }
  >(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value:
            isDefined(defaultValue) && isNonEmptyArray(defaultValue)
              ? defaultValue
              : [],
        },
  );

  const [newItemDraftValue, setNewItemDraftValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [itemToEditIndex, setItemToEditIndex] = useState(-1);
  const isAddingNewItem = itemToEditIndex === -1;

  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownId = `dropdown-${instanceId}`;
  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const preventContainerFocusStackUpdate =
    draftValue.type === 'static' && draftValue.value.length >= 1;

  const formFieldInputInstanceId = `form-array-field-container-${instanceId}`;
  const newItemInputInstanceId = `array-field-input-new-item-${instanceId}`;

  const handleFirstItemInputChange = (value: string) => {
    setNewItemDraftValue(value);
  };

  const handleFirstItemInputEnter = () => {
    setDraftValue({
      type: 'static',
      value: [...draftValue.value, newItemDraftValue],
    });

    onChange([...draftValue.value, newItemDraftValue]);

    setNewItemDraftValue('');

    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
    });

    removeFocusItemFromFocusStackById({
      focusId: formFieldInputInstanceId,
    });
  };

  const handleEditItem = (index: number) => {
    setInputValue(draftValue.value[index]);
    setItemToEditIndex(index);
    setIsInputDisplayed(true);
  };

  const handleDeleteItem = (index: number) => {
    if (draftValue.type !== 'static') {
      throw new Error('Cannot delete item when value is a variable.');
    }

    const updatedItems = toSpliced(draftValue.value, index, 1);

    setDraftValue({
      type: 'static',
      value: updatedItems,
    });
    onChange(updatedItems);

    const isDropdownGoingToBeHiddenNext = updatedItems.length === 0;
    if (isDropdownGoingToBeHiddenNext) {
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

  const handleNewItemInputBlur = () => {
    removeFocusItemFromFocusStackById({
      focusId: newItemInputInstanceId,
    });
  };

  const handleNewItemInputEscape = () => {
    closeDropdown(dropdownId);

    setIsInputDisplayed(false);
    setInputValue('');

    removeFocusItemFromFocusStackById({
      focusId: newItemInputInstanceId,
    });
  };

  const handleNewItemInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleNewItemInputSubmit = () => {
    if (draftValue.type !== 'static') {
      throw new Error('Cannot submit input when value is a variable.');
    }

    const sanitizedInput = inputValue.trim();

    if (sanitizedInput === '' && isAddingNewItem) {
      return;
    }

    if (sanitizedInput === '' && !isAddingNewItem) {
      handleDeleteItem(itemToEditIndex);
      return;
    }

    const items = draftValue.value;

    if (!isAddingNewItem && sanitizedInput === items[itemToEditIndex]) {
      setIsInputDisplayed(false);
      setInputValue('');
      return;
    }

    const updatedItems = isAddingNewItem
      ? [...items, sanitizedInput]
      : toSpliced(items, itemToEditIndex, 1, sanitizedInput);

    setDraftValue({
      type: 'static',
      value: updatedItems,
    });
    onChange(updatedItems);

    setIsInputDisplayed(false);
    setInputValue('');

    removeFocusItemFromFocusStackById({
      focusId: newItemInputInstanceId,
    });
  };

  const handleAddItemButtonClick = () => {
    setItemToEditIndex(-1);
    setIsInputDisplayed(true);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: [],
    });

    setNewItemDraftValue('');

    onChange([]);
  };

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={formFieldInputInstanceId}
          preventFocusStackUpdate={preventContainerFocusStackUpdate}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? (
              <StyledDisplayModeReadonlyContainer>
                {draftValue.value.length > 0 ? (
                  <ArrayDisplay value={draftValue.value} />
                ) : (
                  <StyledPlaceholder />
                )}
              </StyledDisplayModeReadonlyContainer>
            ) : draftValue.value.length === 0 ? (
              <StyledInput
                instanceId={formFieldInputInstanceId}
                placeholder={t`Enter an item`}
                value={newItemDraftValue}
                copyButton={false}
                onChange={handleFirstItemInputChange}
                onEnter={handleFirstItemInputEnter}
                shouldTrim={false}
              />
            ) : (
              <Dropdown
                dropdownId={dropdownId}
                dropdownPlacement="bottom-start"
                dropdownOffset={{
                  y: parseSpacingValueAsNumber(theme.spacing(1)),
                }}
                clickableComponent={
                  <StyledDisplayModeContainer data-open={isDropdownOpen}>
                    <ArrayDisplay value={draftValue.value} />
                  </StyledDisplayModeContainer>
                }
                clickableComponentWidth="100%"
                dropdownComponents={
                  <DropdownContent ref={containerRef}>
                    <DropdownMenuItemsContainer hasMaxHeight>
                      {draftValue.type === 'static' &&
                        draftValue.value.map((value, index) => (
                          <ArrayFieldMenuItem
                            key={index}
                            dropdownId={`array-field-input-${instanceId}-${index}`}
                            value={value}
                            onEdit={() => {
                              handleEditItem(index);
                            }}
                            onDelete={() => {
                              handleDeleteItem(index);
                            }}
                          />
                        ))}
                    </DropdownMenuItemsContainer>

                    <DropdownMenuSeparator />

                    {isInputDisplayed ? (
                      <MultiItemBaseInput
                        instanceId={newItemInputInstanceId}
                        autoFocus
                        placeholder={placeholder}
                        value={inputValue}
                        onFocus={handleNewItemInputFocus}
                        onBlur={handleNewItemInputBlur}
                        onEscape={handleNewItemInputEscape}
                        onChange={handleNewItemInputChange}
                        onEnter={handleNewItemInputSubmit}
                        hasItem
                      />
                    ) : (
                      <DropdownMenuItemsContainer>
                        <MenuItem
                          onClick={handleAddItemButtonClick}
                          LeftIcon={IconPlus}
                          text={t`Add item`}
                        />
                      </DropdownMenuItemsContainer>
                    )}
                  </DropdownContent>
                }
              />
            )
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>

        {VariablePicker && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
