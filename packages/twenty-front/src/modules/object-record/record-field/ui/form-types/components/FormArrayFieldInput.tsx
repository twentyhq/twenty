import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { ArrayFieldMenuItem } from '@/object-record/record-field/ui/meta-types/input/components/ArrayFieldMenuItem';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useId, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledInput = styled(TextInput)`
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
`;

const StyledSelectInputContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: ${({ theme }) => theme.spacing(9)};
`;

const StyledPlaceholder = styled(FormFieldPlaceholder)`
  width: 100%;
`;

const safeParsedValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
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
  const instanceId = useId();
  const theme = useTheme();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldArrayValue;
        editingMode: 'view' | 'edit';
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
          value: isDefined(defaultValue) ? defaultValue : [],
          editingMode: 'view',
        },
  );

  const [newItemDraftValue, setNewItemDraftValue] = useState('');

  const handleDisplayModeClick = () => {
    if (draftValue.type !== 'static') {
      throw new Error(
        'This function can only be called when editing a static value.',
      );
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'edit',
    });

    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.FORM_FIELD_INPUT,
        instanceId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const onOptionSelected = (value: FieldArrayValue) => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      type: 'static',
      value,
      editingMode: 'edit',
    });

    onChange(value);
  };

  const onCancel = () => {
    if (draftValue.type !== 'static') {
      throw new Error('Can only be called when editing a static value');
    }

    setDraftValue({
      ...draftValue,
      editingMode: 'view',
    });

    removeFocusItemFromFocusStackById({ focusId: instanceId });
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
      editingMode: 'view',
    });

    setNewItemDraftValue('');

    onChange([]);
  };

  const placeholderText = placeholder ?? label;

  const containerRef = useRef<HTMLDivElement>(null);

  const dropdownId = `dropdown-${instanceId}`;

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? null : draftValue.value.length < 1 ? (
              <StyledInput
                instanceId={instanceId}
                placeholder={'Enter an item'}
                value={newItemDraftValue}
                copyButton={false}
                onChange={(value) => {
                  setNewItemDraftValue(value);
                }}
                onEnter={() => {
                  setDraftValue({
                    type: 'static',
                    editingMode: 'view',
                    value: [...draftValue.value, newItemDraftValue],
                  });

                  onChange([...draftValue.value, newItemDraftValue]);
                }}
                disabled={readonly}
              />
            ) : (
              <>
                <Dropdown
                  dropdownId={dropdownId}
                  dropdownPlacement="bottom-start"
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
                                console.log('edit item', index);
                              }}
                              onDelete={() => {
                                console.log('delete item', index);
                              }}
                            />
                          ))}
                      </DropdownMenuItemsContainer>

                      <DropdownMenuSeparator />

                      <DropdownMenuItemsContainer>
                        <MenuItem
                          onClick={() => {
                            console.log('add new item');
                          }}
                          LeftIcon={IconPlus}
                          text={`Add item`}
                        />
                      </DropdownMenuItemsContainer>
                    </DropdownContent>
                  }
                />
              </>
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
