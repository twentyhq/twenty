import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';
import { useId, useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { type Nullable } from 'twenty-ui/utilities';

const StyledInputContainer = styled(FormFieldInputInnerContainer)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 0;
  overflow: visible;
  position: relative;
`;

const StyledDateInputAbsoluteContainer = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
`;

const StyledDateInputTextContainer = styled.div`
  align-items: center;
  display: flex;
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

type FormDateTimeFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
  timeZone?: string;
};

export const FormDateTimeFieldInput = ({
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  timeZone,
}: FormDateTimeFieldInputProps) => {
  const instanceId = useId();

  const [draftValue, setDraftValue] = useState<DraftValue>(
    isStandaloneVariableString(defaultValue)
      ? {
          type: 'variable',
          value: defaultValue,
        }
      : {
          type: 'static',
          value: defaultValue !== 'null' ? (defaultValue ?? null) : null,
          mode: 'view',
        },
  );

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const persistDate = (newDate: Nullable<Temporal.ZonedDateTime>) => {
    if (!isDefined(newDate)) {
      onChange(null);
    } else {
      const newDateISO = newDate.toInstant().toString();

      onChange(newDateISO);
    }
  };

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const displayDatePicker =
    draftValue.type === 'static' && draftValue.mode === 'edit';

  useListenClickOutside({
    refs: [datePickerWrapperRef],
    listenerId: 'FormDateTimeFieldInputBase',
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

  const handlePickerChange = (newDate: Nullable<Temporal.ZonedDateTime>) => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate?.toPlainDate().toString() ?? null,
    });

    persistDate(newDate);
  };

  const handlePickerEnter = () => {};

  const handlePickerEscape = () => {
    // FIXME: Escape key is not handled properly by the underlying DateInput component. We need to solve that.

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

  const handlePickerMouseSelect = (
    newDate: Nullable<Temporal.ZonedDateTime>,
  ) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toPlainDate().toString() ?? null,
      mode: 'view',
    });

    persistDate(newDate);
  };

  const handleInputFocus = () => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: draftValue.value,
    });
  };

  const handleInputChange = (newDate: Temporal.ZonedDateTime | null) => {
    if (!isDefined(newDate)) {
      return;
    }

    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate.toPlainDate().toString(),
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

  const dateValue = isStandaloneVariableString(defaultValue)
    ? null
    : defaultValue === 'null' || defaultValue === '' || !isDefined(defaultValue)
      ? null
      : Temporal.Instant.from(defaultValue).toZonedDateTimeISO(
          timeZone ?? userTimezone,
        );

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledInputContainer
          formFieldInputInstanceId={instanceId}
          ref={datePickerWrapperRef}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            <>
              <StyledDateInputTextContainer>
                <DateTimePickerInput
                  date={dateValue}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  readonly={readonly}
                  timeZone={timeZone}
                />
              </StyledDateInputTextContainer>
              {draftValue.mode === 'edit' ? (
                <StyledDateInputContainer>
                  <StyledDateInputAbsoluteContainer>
                    <OverlayContainer>
                      <DateTimePicker
                        instanceId={instanceId}
                        date={dateValue}
                        onChange={handlePickerChange}
                        onClose={handlePickerMouseSelect}
                        onEnter={handlePickerEnter}
                        onEscape={handlePickerEscape}
                        onClear={handlePickerClear}
                        hideHeaderInput
                        timeZone={timeZone}
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
        </StyledInputContainer>
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
