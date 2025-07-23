import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { useDateParser } from '@/ui/input/components/internal/hooks/useDateParser';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { ChangeEvent, KeyboardEvent, useId, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';
import { Nullable } from 'twenty-ui/utilities';

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

const StyledDateInput = styled.input<{ hasError?: boolean }>`
  ${TEXT_INPUT_STYLE}

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  ${({ hasError, theme }) =>
    hasError &&
    css`
      color: ${theme.color.red};
    `};
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
  dateOnly?: boolean;
  label?: string;
  defaultValue: string | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormDateTimeFieldInput = ({
  dateOnly,
  label,
  defaultValue,
  onChange,
  VariablePicker,
  readonly,
  placeholder,
}: FormDateTimeFieldInputProps) => {
  const { parseToString, parseToDate } = useDateParser({
    isDateTimeInput: !dateOnly,
  });

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

  const draftValueAsDate =
    isDefined(draftValue.value) && isNonEmptyString(draftValue.value)
      ? new Date(draftValue.value)
      : null;

  const [pickerDate, setPickerDate] =
    useState<Nullable<Date>>(draftValueAsDate);

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const [inputDateTime, setInputDateTime] = useState(
    isDefined(draftValueAsDate) && !isStandaloneVariableString(defaultValue)
      ? parseToString(draftValueAsDate)
      : '',
  );

  const persistDate = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      onChange(null);
    } else {
      const newDateISO = newDate.toISOString();

      onChange(newDateISO);
    }
  };

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const displayDatePicker =
    draftValue.type === 'static' && draftValue.mode === 'edit';

  const placeholderToDisplay =
    placeholder ?? (dateOnly ? 'mm/dd/yyyy' : 'mm/dd/yyyy hh:mm');

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

  const handlePickerChange = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate?.toDateString() ?? null,
    });

    setInputDateTime(isDefined(newDate) ? parseToString(newDate) : '');

    setPickerDate(newDate);

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

    setPickerDate(null);

    setInputDateTime('');

    persistDate(null);
  };

  const handlePickerMouseSelect = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      mode: 'view',
    });

    setPickerDate(newDate);

    setInputDateTime(isDefined(newDate) ? parseToString(newDate) : '');

    persistDate(newDate);
  };

  const handleInputFocus = () => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: draftValue.value,
    });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputDateTime(event.target.value);
  };

  const handleInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    const inputDateTimeTrimmed = inputDateTime.trim();

    if (inputDateTimeTrimmed === '') {
      handlePickerClear();
      return;
    }

    const parsedInputDateTime = parseToDate(inputDateTimeTrimmed);

    if (!isDefined(parsedInputDateTime)) {
      return;
    }

    let validatedDate = parsedInputDateTime;
    if (parsedInputDateTime < MIN_DATE) {
      validatedDate = MIN_DATE;
    } else if (parsedInputDateTime > MAX_DATE) {
      validatedDate = MAX_DATE;
    }

    setDraftValue({
      type: 'static',
      value: validatedDate.toDateString(),
      mode: 'edit',
    });

    setPickerDate(validatedDate);

    setInputDateTime(parseToString(validatedDate));

    persistDate(validatedDate);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    setInputDateTime('');

    onChange(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: null,
      mode: 'view',
    });

    setPickerDate(null);

    onChange(null);
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handlePickerEscape,
    focusId: instanceId,
    dependencies: [handlePickerEscape],
  });

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
              <StyledDateInput
                type="text"
                placeholder={placeholderToDisplay}
                value={inputDateTime}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                onKeyDown={handleInputKeydown}
                disabled={readonly}
              />

              {draftValue.mode === 'edit' ? (
                <StyledDateInputContainer>
                  <StyledDateInputAbsoluteContainer>
                    <OverlayContainer>
                      <DateTimePicker
                        date={pickerDate ?? new Date()}
                        isDateTimeInput={false}
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
