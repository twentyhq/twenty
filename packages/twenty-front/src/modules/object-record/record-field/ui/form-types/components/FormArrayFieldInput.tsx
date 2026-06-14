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
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useContext, useId, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui-deprecated/display';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { MenuItem } from 'twenty-ui-deprecated/navigation';
import { toSpliced } from '~/utils/array/toSpliced';
import { v4 } from 'uuid';

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
  padding-inline: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledDisplayModeContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  height: 30px;
  padding-inline: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover,
  &[data-open='true'] {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledInputContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholderContainer = styled.div`
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
  const { theme } = useContext(ThemeContext);
  const instanceId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const { closeDropdown } = useCloseDropdown();
  const { openDropdown } = useOpenDropdown();

  const getInitialDraftValue = () => {
    if (isStandaloneVariableString(defaultValue)) {
      return {
        type: 'variable' as const,
        value: defaultValue,
      };
    }

    const defaultArray = (() => {
      if (isDefined(defaultValue) && isNonEmptyArray(defaultValue)) {
        return defaultValue;
      }
      return [];
    })();

    return {
      type: 'static' as const,
      value: defaultArray.map((val) => ({ id: v4(), value: val })),
    };
  };

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: { id: string; value: string }[];
      }
    | {
        type: 'variable';
        value: string;
      }
  >(getInitialDraftValue);

  const [newItemDraftValue, setNewItemDraftValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [itemToEditIndex, setItemToEditIndex] = useState(-1);
  const isAddingNewItem = itemToEditIndex === -1;

  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownId = `dropdown-${instanceId}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const preventContainerFocusStackUpdate =
    draftValue.type === 'static' && isNonEmptyArray(draftValue.value);

  const formFieldInputInstanceId = `form-array-field-container-${instanceId}`;
  const newItemInputInstanceId = `array-field-input-new-item-${instanceId}`;

  const handleFirstItemInputChange = (value: string) => {
    setNewItemDraftValue(value);
  };

  const handleFirstItemInputEnter = () => {
    if (draftValue.type !== 'static') {
      return;
    }

    const newItems = [
      ...draftValue.value,
      { id: v4(), value: newItemDraftValue },
    ];

    setDraftValue({
      type: 'static',
      value: newItems,
    });

    onChange(newItems.map((item) => item.value));

    setNewItemDraftValue('');

    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
    });

    removeFocusItemFromFocusStackById({
      focusId: formFieldInputInstanceId,
    });
  };

  const handleEditItem = (index: number) => {
    if (draftValue.type !== 'static') return;
    setInputValue(draftValue.value[index].value);
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
    onChange(updatedItems.map((item) => item.value));

    const isDropdownGoingToBeHiddenNext = !isNonEmptyArray(updatedItems);
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

    const itemToEdit = items[itemToEditIndex];
    if (!isAddingNewItem && !isDefined(itemToEdit)) {
      setIsInputDisplayed(false);
      setInputValue('');
      setItemToEditIndex(-1);
      return;
    }

    if (!isAddingNewItem && sanitizedInput === itemToEdit?.value) {
      setIsInputDisplayed(false);
      setInputValue('');
      return;
    }

    let updatedItems;

    if (isAddingNewItem) {
      updatedItems = [...items, { id: v4(), value: sanitizedInput }];
    } else {
      updatedItems = toSpliced(items, itemToEditIndex, 1, {
        id: itemToEdit.id,
        value: sanitizedInput,
      });
    }

    setDraftValue({
      type: 'static',
      value: updatedItems,
    });
    onChange(updatedItems.map((item) => item.value));

    setIsInputDisplayed(false);
    setInputValue('');
    setItemToEditIndex(-1);

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

  const renderDropdownInputOrButton = () => {
    if (isInputDisplayed) {
      return (
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
      );
    }

    return (
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={handleAddItemButtonClick}
          LeftIcon={IconPlus}
          text={t`Add item`}
        />
      </DropdownMenuItemsContainer>
    );
  };

  const getOnRemoveHandler = () => {
    if (readonly) {
      return undefined;
    }
    return handleUnlinkVariable;
  };

  const renderInnerContent = () => {
    if (draftValue.type !== 'static') {
      return (
        <VariableChipStandalone
          rawVariableName={draftValue.value}
          onRemove={getOnRemoveHandler()}
        />
      );
    }

    if (readonly) {
      if (isNonEmptyArray(draftValue.value)) {
        return (
          <StyledDisplayModeReadonlyContainer>
            <ArrayDisplay value={draftValue.value.map((i) => i.value)} />
          </StyledDisplayModeReadonlyContainer>
        );
      }
      return (
        <StyledDisplayModeReadonlyContainer>
          <StyledPlaceholderContainer>
            <FormFieldPlaceholder />
          </StyledPlaceholderContainer>
        </StyledDisplayModeReadonlyContainer>
      );
    }

    if (!isNonEmptyArray(draftValue.value)) {
      return (
        <StyledInputContainer>
          <TextInput
            instanceId={formFieldInputInstanceId}
            placeholder={t`Enter an item`}
            value={newItemDraftValue}
            copyButton={false}
            onChange={handleFirstItemInputChange}
            onEnter={handleFirstItemInputEnter}
            shouldTrim={false}
          />
        </StyledInputContainer>
      );
    }

    return (
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        dropdownOffset={{
          y: parseSpacingValueAsNumber(theme.spacing[1]),
        }}
        clickableComponent={
          <StyledDisplayModeContainer data-open={isDropdownOpen}>
            <ArrayDisplay value={draftValue.value.map((i) => i.value)} />
          </StyledDisplayModeContainer>
        }
        clickableComponentWidth="100%"
        dropdownComponents={
          <DropdownContent ref={containerRef}>
            <DropdownMenuItemsContainer hasMaxHeight>
              {draftValue.type === 'static' &&
                draftValue.value.map((item, index) => (
                  <ArrayFieldMenuItem
                    key={item.id}
                    dropdownId={`array-field-input-${instanceId}-${item.id}`}
                    value={item.value}
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

            {renderDropdownInputOrButton()}
          </DropdownContent>
        }
      />
    );
  };

  const renderLabel = () => {
    if (label) {
      return <InputLabel>{label}</InputLabel>;
    }
    return null;
  };

  return (
    <FormFieldInputContainer data-testid={testId}>
      {renderLabel()}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={formFieldInputInstanceId}
          preventFocusStackUpdate={preventContainerFocusStackUpdate}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {renderInnerContent()}
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
