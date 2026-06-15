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

  const [stableIds, setStableIds] = useState<string[]>(() => {
    if (isStandaloneVariableString(defaultValue)) {
      return [];
    }
    const initialItems =
      isDefined(defaultValue) && isNonEmptyArray(defaultValue)
        ? defaultValue
        : [];
    return initialItems.map(() => v4());
  });

  const [newItemDraftValue, setNewItemDraftValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isInputDisplayed, setIsInputDisplayed] = useState(false);
  const [itemToEditId, setItemToEditId] = useState<string | null>(null);
  const isAddingNewItem = itemToEditId === null;

  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownId = `dropdown-${instanceId}`;
  const isDropdownOpen = useAtomComponentStateValue(
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
    if (draftValue.type !== 'static') {
      return;
    }

    const updatedItems = [...draftValue.value, newItemDraftValue];
    setDraftValue({
      type: 'static',
      value: updatedItems,
    });
    setStableIds((prev) => [...prev, v4()]);

    onChange(updatedItems);

    setNewItemDraftValue('');

    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
    });

    removeFocusItemFromFocusStackById({
      focusId: formFieldInputInstanceId,
    });
  };

  const handleEditItem = (id: string) => {
    if (draftValue.type !== 'static') {
      return;
    }
    const index = stableIds.indexOf(id);
    if (index !== -1) {
      setInputValue(draftValue.value[index]);
      setItemToEditId(id);
      setIsInputDisplayed(true);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (draftValue.type !== 'static') {
      throw new Error('Cannot delete item when value is a variable.');
    }

    const index = stableIds.indexOf(id);
    if (index === -1) {
      return;
    }

    const updatedItems = toSpliced(draftValue.value, index, 1);
    const updatedIds = toSpliced(stableIds, index, 1);

    setDraftValue({
      type: 'static',
      value: updatedItems,
    });
    setStableIds(updatedIds);
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
      if (isDefined(itemToEditId)) {
        handleDeleteItem(itemToEditId);
      }
      return;
    }

    const items = draftValue.value;

    if (!isAddingNewItem && isDefined(itemToEditId)) {
      const index = stableIds.indexOf(itemToEditId);
      if (index !== -1) {
        if (sanitizedInput === items[index]) {
          setIsInputDisplayed(false);
          setInputValue('');
          return;
        }

        const updatedItems = toSpliced(items, index, 1, sanitizedInput);

        setDraftValue({
          type: 'static',
          value: updatedItems,
        });
        onChange(updatedItems);
      }
    } else {
      const updatedItems = [...items, sanitizedInput];
      setDraftValue({
        type: 'static',
        value: updatedItems,
      });
      setStableIds((prev) => [...prev, v4()]);
      onChange(updatedItems);
    }

    setIsInputDisplayed(false);
    setInputValue('');

    removeFocusItemFromFocusStackById({
      focusId: newItemInputInstanceId,
    });
  };

  const handleAddItemButtonClick = () => {
    setItemToEditId(null);
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
    setStableIds([]);

    setNewItemDraftValue('');

    onChange([]);
  };

  const renderLabel = () => {
    if (isDefined(label)) {
      return <InputLabel>{label}</InputLabel>;
    }
    return null;
  };

  const renderReadonlyDisplay = (items: string[]) => {
    if (items.length > 0) {
      return <ArrayDisplay value={items} />;
    }
    return (
      <StyledPlaceholderContainer>
        <FormFieldPlaceholder />
      </StyledPlaceholderContainer>
    );
  };

  const renderEmptyInput = () => {
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
  };

  const renderDropdownMenuItems = (items: string[]) => {
    return (
      <DropdownMenuItemsContainer hasMaxHeight>
        {items.map((value, index) => {
          const id = stableIds[index] || index.toString();
          return (
            <ArrayFieldMenuItem
              key={id}
              dropdownId={`array-field-input-${instanceId}-${id}`}
              value={value}
              onEdit={() => {
                handleEditItem(id);
              }}
              onDelete={() => {
                handleDeleteItem(id);
              }}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    );
  };

  const renderNewItemInputOrAddButton = () => {
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

  const renderDropdown = (items: string[]) => {
    return (
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        dropdownOffset={{
          y: parseSpacingValueAsNumber(theme.spacing[1]),
        }}
        clickableComponent={
          <StyledDisplayModeContainer data-open={isDropdownOpen}>
            <ArrayDisplay value={items} />
          </StyledDisplayModeContainer>
        }
        clickableComponentWidth="100%"
        dropdownComponents={
          <DropdownContent ref={containerRef}>
            {renderDropdownMenuItems(items)}
            <DropdownMenuSeparator />
            {renderNewItemInputOrAddButton()}
          </DropdownContent>
        }
      />
    );
  };

  const renderStaticContent = (items: string[]) => {
    if (readonly) {
      return (
        <StyledDisplayModeReadonlyContainer>
          {renderReadonlyDisplay(items)}
        </StyledDisplayModeReadonlyContainer>
      );
    }
    if (items.length === 0) {
      return renderEmptyInput();
    }
    return renderDropdown(items);
  };

  const renderInnerContent = () => {
    if (draftValue.type === 'static') {
      return renderStaticContent(draftValue.value);
    }
    return (
      <VariableChipStandalone
        rawVariableName={draftValue.value}
        onRemove={readonly ? undefined : handleUnlinkVariable}
      />
    );
  };

  const renderVariablePicker = () => {
    if (isDefined(VariablePicker) && !readonly) {
      return (
        <VariablePicker
          instanceId={instanceId}
          onVariableSelect={handleVariableTagInsert}
        />
      );
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

        {renderVariablePicker()}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
