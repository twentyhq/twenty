import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';

import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-field/ui/meta-types/input/constants/SelectFieldInputSelectableListComponentInstanceId';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { MultiSelectDisplay } from '@/ui/field/display/components/MultiSelectDisplay';
import { MultiSelectInput } from '@/ui/field/input/components/MultiSelectInput';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { useTheme } from '@emotion/react';
import { isArray } from '@sniptt/guards';
import { useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { VisibilityHidden } from 'twenty-ui/accessibility';
import { IconChevronDown } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';

type FormMultiSelectFieldInputProps = {
  label?: string;
  defaultValue: FieldMultiSelectValue | string | undefined;
  options: SelectOption[];
  onChange: (value: FieldMultiSelectValue | string) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  placeholder?: string;
  testId?: string;
  hint?: string;
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
  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
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

export const FormMultiSelectFieldInput = ({
  label,
  defaultValue,
  options,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
  testId,
  hint,
}: FormMultiSelectFieldInputProps) => {
  const instanceId = useId();
  const theme = useTheme();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const [draftValue, setDraftValue] = useState<
    | {
        type: 'static';
        value: FieldMultiSelectValue | string;
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

  const onOptionSelected = (value: FieldMultiSelectValue) => {
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

    onChange([]);
  };

  const selectedNames =
    draftValue.type === 'static' && isDefined(draftValue.value)
      ? isArray(draftValue.value)
        ? draftValue.value
        : safeParsedValue(draftValue.value)
      : undefined;

  const selectedOptions =
    isDefined(selectedNames) && isDefined(options) && isArray(selectedNames)
      ? options.filter((option) =>
          selectedNames.some((name) => option.value === name),
        )
      : undefined;

  const placeholderText = placeholder ?? label;

  return (
    <FormFieldInputContainer data-testid={testId}>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            readonly ? (
              <StyledDisplayModeReadonlyContainer>
                {isDefined(selectedOptions) && selectedOptions.length > 0 ? (
                  <MultiSelectDisplay
                    values={selectedNames}
                    options={selectedOptions}
                  />
                ) : (
                  <StyledPlaceholder />
                )}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.light}
                />
              </StyledDisplayModeReadonlyContainer>
            ) : (
              <StyledDisplayModeContainer
                data-open={draftValue.editingMode === 'edit'}
                onClick={handleDisplayModeClick}
              >
                <VisibilityHidden>{t`Edit`}</VisibilityHidden>

                {isDefined(selectedOptions) && selectedOptions.length > 0 ? (
                  <MultiSelectDisplay
                    values={selectedNames}
                    options={selectedOptions}
                  />
                ) : (
                  <StyledPlaceholder>{placeholderText}</StyledPlaceholder>
                )}
                <IconChevronDown
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              </StyledDisplayModeContainer>
            )
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>
        <StyledSelectInputContainer>
          {draftValue.type === 'static' &&
            draftValue.editingMode === 'edit' && (
              <OverlayContainer>
                <MultiSelectInput
                  selectableListComponentInstanceId={
                    SELECT_FIELD_INPUT_SELECTABLE_LIST_COMPONENT_INSTANCE_ID
                  }
                  focusId={instanceId}
                  options={options}
                  onCancel={onCancel}
                  onOptionSelected={onOptionSelected}
                  values={selectedNames}
                  dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
                />
              </OverlayContainer>
            )}
        </StyledSelectInputContainer>

        {VariablePicker && !readonly && (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        )}
      </FormFieldInputRowContainer>
      {hint ? <InputHint>{hint}</InputHint> : null}
    </FormFieldInputContainer>
  );
};
