import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { DateInput } from '@/ui/field/input/components/DateInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { parseDateToString } from '@/ui/input/components/internal/date/utils/parseDateToString';
import { parseStringToDate } from '@/ui/input/components/internal/date/utils/parseStringToDate';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ChangeEvent, KeyboardEvent, useId, useRef, useState } from 'react';
import { isDefined, Nullable, TEXT_INPUT_STYLE } from 'twenty-ui';

const StyledInputContainer = styled(StyledFormFieldInputInputContainer)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 0px;
  overflow: visible;
`;

const StyledDateInputAbsoluteContainer = styled.div`
  position: absolute;
`;

const StyledDateInput = styled.input<{ hasError?: boolean }>`
  ${TEXT_INPUT_STYLE}

  ${({ hasError, theme }) =>
    hasError &&
    css`
      color: ${theme.color.red};
    `};
`;

// Inspired by the StyledInlineCellInput component.
const StyledDateInputContainer = styled.div`
  position: relative;
  z-index: 1000;
`;

type DraftValue =
  | {
      type: 'static';
      value: string | null;
      editingMode: 'view' | 'edit';
    }
  | {
      type: 'variable';
      value: string;
    };

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function assertStaticDraftValue(
  draftValue: DraftValue,
): asserts draftValue is DraftValue & { type: 'static' } {
  if (draftValue.type !== 'static') {
    throw new Error('Expected the draftValue to be static');
  }
}

type FormDateFieldInputProps = {
  label?: string;
  defaultValue: string | undefined;
  onPersist: (value: string | null) => void;
  VariablePicker?: VariablePickerComponent;
};

export const FormDateFieldInput = ({
  label,
  defaultValue,
  onPersist,
  VariablePicker,
}: FormDateFieldInputProps) => {
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
          editingMode: 'view',
        },
  );

  const dateValue = isDefined(draftValue.value)
    ? new Date(draftValue.value)
    : null;

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const [temporaryValue, setTemporaryValue] =
    useState<Nullable<Date>>(dateValue);

  const [inputDateTime, setInputDateTime] = useState(
    isDefined(dateValue) && !isStandaloneVariableString(defaultValue)
      ? parseDateToString({
          date: dateValue,
          isDateTimeInput: false,
          userTimezone: undefined,
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

  const handlePickerChange = (newDate: Nullable<Date>) => {
    assertStaticDraftValue(draftValue);

    setDraftValue({
      ...draftValue,
      value: newDate?.toDateString() ?? null,
    });

    setInputDateTime(
      isDefined(newDate)
        ? parseDateToString({
            date: newDate,
            isDateTimeInput: false,
            userTimezone: undefined,
          })
        : '',
    );

    persistDate(newDate);
  };

  const handlePickerEnter = () => {};

  const handlePickerEscape = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handlePickerClickOutside = (
    _event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handlePickerClear = () => {
    setDraftValue({
      type: 'static',
      value: null,
      editingMode: 'view',
    });

    setTemporaryValue(null);

    setInputDateTime('');

    persistDate(null);
  };

  const handlePickerSubmit = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handleInputFocus = () => {
    setDraftValue({
      type: 'static',
      editingMode: 'edit',
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
      isDateTimeInput: false,
      userTimezone: undefined,
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
      editingMode: 'edit',
    });

    setTemporaryValue(validatedDate);

    setInputDateTime(
      parseDateToString({
        date: validatedDate,
        isDateTimeInput: false,
        userTimezone: undefined,
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
      editingMode: 'view',
    });

    setTemporaryValue(null);

    onPersist(null);
  };

  return (
    <StyledFormFieldInputContainer>
      {label ? <InputLabel>{label}</InputLabel> : null}

      <StyledFormFieldInputRowContainer>
        <StyledInputContainer
          ref={datePickerWrapperRef}
          hasRightElement={isDefined(VariablePicker)}
        >
          {draftValue.type === 'static' ? (
            <>
              <StyledDateInput
                type="text"
                placeholder="mm/dd/yyyy"
                value={inputDateTime}
                onFocus={handleInputFocus}
                onChange={handleInputChange}
                onKeyDown={handleInputKeydown}
              />

              {draftValue.editingMode === 'edit' ? (
                <StyledDateInputContainer>
                  <StyledDateInputAbsoluteContainer>
                    <DateInput
                      clearable
                      onChange={handlePickerChange}
                      onEscape={handlePickerEscape}
                      onClickOutside={handlePickerClickOutside}
                      onEnter={handlePickerEnter}
                      onClear={handlePickerClear}
                      onSubmit={handlePickerSubmit}
                      hideHeaderInput
                      wrapperRef={datePickerWrapperRef}
                      temporaryValue={temporaryValue}
                      setTemporaryValue={setTemporaryValue}
                    />
                  </StyledDateInputAbsoluteContainer>
                </StyledDateInputContainer>
              ) : null}
            </>
          ) : (
            <VariableChip
              rawVariableName={draftValue.value}
              onRemove={handleUnlinkVariable}
            />
          )}
        </StyledInputContainer>

        {VariablePicker ? (
          <VariablePicker
            inputId={inputId}
            onVariableSelect={handleVariableTagInsert}
          />
        ) : null}
      </StyledFormFieldInputRowContainer>
    </StyledFormFieldInputContainer>
  );
};
