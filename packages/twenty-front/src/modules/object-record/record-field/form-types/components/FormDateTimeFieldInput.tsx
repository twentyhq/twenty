import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { InputLabel } from '@/ui/input/components/InputLabel';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_ID,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { parseDateToString } from '@/ui/input/components/internal/date/utils/parseDateToString';
import { parseStringToDate } from '@/ui/input/components/internal/date/utils/parseStringToDate';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { UserContext } from '@/users/contexts/UserContext';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useId,
  useRef,
  useState,
} from 'react';
import { isDefined, Nullable, TEXT_INPUT_STYLE } from 'twenty-ui';

const StyledInputContainer = styled(FormFieldInputInputContainer)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 0px;
  overflow: visible;
  position: relative;
`;

const StyledDateInputAbsoluteContainer = styled.div`
  position: absolute;
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
  placeholder?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormDateTimeFieldInput = ({
  dateOnly,
  label,
  defaultValue,
  onPersist,
  VariablePicker,
  readonly,
}: FormDateTimeFieldInputProps) => {
  const { timeZone } = useContext(UserContext);

  const inputId = useId();

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

  const draftValueAsDate = isDefined(draftValue.value)
    ? new Date(draftValue.value)
    : null;

  const [pickerDate, setPickerDate] =
    useState<Nullable<Date>>(draftValueAsDate);

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const [inputDateTime, setInputDateTime] = useState(
    isDefined(draftValueAsDate) && !isStandaloneVariableString(defaultValue)
      ? parseDateToString({
          date: draftValueAsDate,
          isDateTimeInput: !dateOnly,
          userTimezone: timeZone,
        })
      : '',
  );

  const persistDate = (newDate: Nullable<Date>) => {
    if (!isDefined(newDate)) {
      onPersist(null);
    } else {
      const newDateISO = newDate.toISOString();

      onPersist(newDateISO);
    }
  };

  const { closeDropdown } = useDropdown(MONTH_AND_YEAR_DROPDOWN_ID);
  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  const displayDatePicker =
    draftValue.type === 'static' && draftValue.mode === 'edit';

  const placeholder = dateOnly ? 'mm/dd/yyyy' : 'mm/dd/yyyy hh:mm';

  useListenClickOutside({
    refs: [datePickerWrapperRef],
    listenerId: 'FormDateTimeFieldInputBase',
    callback: (event) => {
      event.stopImmediatePropagation();

      closeDropdownYearSelect();
      closeDropdownMonthSelect();
      closeDropdown();
      handlePickerClickOutside();
    },
    enabled: displayDatePicker,
  });

  const handlePickerChange = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      mode: 'edit',
      value: newDate?.toDateString() ?? null,
    });

    setInputDateTime(
      isDefined(newDate)
        ? parseDateToString({
            date: newDate,
            isDateTimeInput: !dateOnly,
            userTimezone: timeZone,
          })
        : '',
    );

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

    setInputDateTime(
      isDefined(newDate)
        ? parseDateToString({
            date: newDate,
            isDateTimeInput: !dateOnly,
            userTimezone: timeZone,
          })
        : '',
    );

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

    const parsedInputDateTime = parseStringToDate({
      dateAsString: inputDateTimeTrimmed,
      isDateTimeInput: !dateOnly,
      userTimezone: timeZone,
    });

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

    setInputDateTime(
      parseDateToString({
        date: validatedDate,
        isDateTimeInput: !dateOnly,
        userTimezone: timeZone,
      }),
    );

    persistDate(validatedDate);
  };

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

    setInputDateTime('');

    onPersist(variableName);
  };

  const handleUnlinkVariable = () => {
    setDraftValue({
      type: 'static',
      value: null,
      mode: 'view',
    });

    setPickerDate(null);

    onPersist(null);
  };

  return (
    <FormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <StyledInputContainer
          ref={datePickerWrapperRef}
          hasRightElement={isDefined(VariablePicker) && !readonly}
        >
          {draftValue.type === 'static' ? (
            <>
              <StyledDateInput
                type="text"
                placeholder={placeholder}
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
            <VariableChip
              rawVariableName={draftValue.value}
              onRemove={readonly ? undefined : handleUnlinkVariable}
            />
          )}
        </StyledInputContainer>

        {VariablePicker && !readonly ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
