import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import {
  DatePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DatePicker';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type Nullable } from 'twenty-ui/utilities';

const StyledDateInputAbsoluteContainer = styled.div`
  position: absolute;
  top: ${themeCssVariables.spacing[1]};
`;

const StyledDateInputTextContainer = styled.div<{ isReadonly?: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
  pointer-events: ${({ isReadonly }) => (isReadonly ? 'none' : 'auto')};
  user-select: ${({ isReadonly }) => (isReadonly ? 'none' : 'auto')};
  width: 100%;

  & input {
    color: ${({ isReadonly }) =>
      isReadonly
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.primary};
  }
`;

const StyledDateInputContainer = styled.div`
  position: relative;
  z-index: 1;
`;

type DraftValue =
  | {
      type: 'static';
      value: string | null;
      mode: 'view' | 'edit';
    }
  | {
      type: 'variable';
      value: string;
    };

type FormDateFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormDateFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
}: FormDateFieldInputProps) => {
  const instanceId = useId();

  const [draftValue, setDraftValue] = useState<DraftValue>(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: defaultValue ?? null,
          mode: 'view',
        },
  );

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const persistDate = (newDate: Nullable<string>) => {
    if (!isDefined(newDate)) {
      onChange(null);
    } else {
      onChange(newDate);
    }
  };

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const displayDatePicker =
    draftValue.type === 'static' && draftValue.mode === 'edit';

  useListenClickOutside({
    refs: [datePickerWrapperRef],
    listenerId: 'FormDateFieldInputBase',
    callback: (event) => {
      event.stopImmediatePropagation();

      closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
      closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
      handlePickerClickOutside();
    },
    enabled: displayDatePicker,
    excludedClickOutsideIds: [
      MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
      MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
    ],
  });

  const handlePickerChange = (newDate: Nullable<string>) => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate ?? null,
    });

    persistDate(newDate);
  };

  const handlePickerEnter = () => {};

  const handlePickerEscape = () => {
    setDraftValue({
      type: 'static',
      value: draftValue.value,
      mode: 'view',
    });
  };

  const handlePickerClickOutside = () => {
    setDraftValue({
      type: 'static',
      value: draftValue.value,
      mode: 'view',
    });
  };

  const handlePickerClear = () => {
    setDraftValue({
      type: 'static',
      value: null,
      mode: 'view',
    });

    persistDate(null);
  };

  const handlePickerMouseSelect = (newDate: Nullable<string>) => {
    setDraftValue({
      type: 'static',
      value: newDate ?? null,
      mode: 'view',
    });

    persistDate(newDate);
  };

  const handleInputChange = (newDate: string | null) => {
    if (!isDefined(newDate)) {
      return;
    }

    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate,
    });

    persistDate(newDate);
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
      value: null,
      mode: 'view',
    });

    onChange(null);
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handlePickerEscape,
    focusId: instanceId,
    dependencies: [handlePickerEscape],
  });

  const { userTimezone } = useUserTimezone();

  const isVariable = Boolean(isStandaloneVariableString(defaultValue));

  const plainDateValueFromProps =
    isVariable ||
    !isDefined(defaultValue) ||
    defaultValue === '' ||
    defaultValue === 'null'
      ? null
      : defaultValue.includes('T')
        ? Temporal.Instant.from(defaultValue)
            .toZonedDateTimeISO(userTimezone)
            .toPlainDate()
            .toString()
        : Temporal.PlainDate.from(defaultValue).toString();

  const plainDateValue =
    draftValue.type === 'static' && isNonEmptyString(draftValue.value)
      ? draftValue.value
      : plainDateValueFromProps;

  const handleMaskedDatePointerDownCapture = () => {
    if (readonly) {
      return;
    }

    setDraftValue((previous) =>
      previous.type === 'static' && previous.mode === 'view'
        ? { ...previous, mode: 'edit' }
        : previous,
    );
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          ref={datePickerWrapperRef}
          formFieldInputInstanceId={instanceId}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            <>
              <StyledDateInputTextContainer
                isReadonly={readonly === true}
                onPointerDownCapture={handleMaskedDatePointerDownCapture}
              >
                <DatePickerInput
                  date={plainDateValue}
                  onChange={handleInputChange}
                  readonly={readonly}
                />
              </StyledDateInputTextContainer>
              {draftValue.mode === 'edit' && !readonly ? (
                <StyledDateInputContainer>
                  <StyledDateInputAbsoluteContainer>
                    <OverlayContainer>
                      <DatePicker
                        instanceId={instanceId}
                        plainDateString={plainDateValue}
                        onChange={handlePickerChange}
                        onClose={handlePickerMouseSelect}
                        onEnter={handlePickerEnter}
                        onEscape={handlePickerEscape}
                        onClear={handlePickerClear}
                        hideHeaderInput
                      />
                    </OverlayContainer>
                  </StyledDateInputAbsoluteContainer>
                </StyledDateInputContainer>
              ) : null}
            </>
          ) : (
            <VariableChipStandalone
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </FormFieldInputInnerContainer>
        {VariablePicker && !readonly ? (
          <VariablePicker
            instanceId={instanceId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
