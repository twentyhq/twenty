import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { DateInput } from '@/ui/field/input/components/DateInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { useId, useMemo, useRef, useState } from 'react';
import { isDefined, Nullable, TEXT_INPUT_STYLE } from 'twenty-ui';

const StyledDisplayModeContainer = styled.button`
  width: 100%;
  align-items: center;
  display: flex;
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  text-align: left;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledInputContainer = styled(StyledFormFieldInputInputContainer)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 0px;
  overflow: visible;
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
  // TODO: unify with packages/twenty-front/src/modules/ui/input/components/internal/date/hooks/useDateTimeInput.tsx
  const parseDateToString = (date: any) => {
    // FIXME
    const isDateTimeInput = false;
    const parsingFormat = isDateTimeInput ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy';
    const userTimezone = undefined;

    const dateParsed = DateTime.fromJSDate(date, { zone: userTimezone });

    const dateWithoutTime = DateTime.fromJSDate(date)
      .toLocal()
      .set({
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });

    const formattedDate = isDateTimeInput
      ? dateParsed.setZone(userTimezone).toFormat(parsingFormat)
      : dateWithoutTime.toFormat(parsingFormat);

    return formattedDate;
  };

  // TODO: unify with packages/twenty-front/src/modules/ui/input/components/internal/date/hooks/useDateTimeInput.tsx
  const parseStringToDate = (str: string) => {
    // FIXME
    const isDateTimeInput = false;
    const parsingFormat = isDateTimeInput ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy';
    const userTimezone = undefined;

    const parsedDate = isDateTimeInput
      ? DateTime.fromFormat(str, parsingFormat, { zone: userTimezone })
      : DateTime.fromFormat(str, parsingFormat, { zone: 'utc' });

    const isValid = parsedDate.isValid;

    if (!isValid) {
      return null;
    }

    const jsDate = parsedDate.toJSDate();

    return jsDate;
  };

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

  const dateValue = useMemo(
    () => (isDefined(draftValue.value) ? new Date(draftValue.value) : null),
    [draftValue.value],
  );

  const persistDate = (newDate: Nullable<Date>) => {
    console.log('persisting date', newDate);

    if (!isDefined(newDate)) {
      onPersist(null);
    } else {
      const newDateISO = newDate.toISOString();

      onPersist(newDateISO);
    }
  };

  const handleChange = (newDate: Nullable<Date>) => {
    assertStaticDraftValue(draftValue);

    setDraftValue({
      ...draftValue,
      value: newDate?.toDateString() ?? null,
    });

    setInputDateTime(isDefined(newDate) ? parseDateToString(newDate) : '');

    persistDate(newDate);
  };

  const handleEnter = () => {
    console.log('noop');
  };

  const handleEscape = (newDate: Nullable<Date>) => {
    console.log('should just go in view mode');

    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handleClickOutside = (
    _event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => {
    console.log('should just go in view mode');

    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handleClear = () => {
    setDraftValue({
      type: 'static',
      value: null,
      editingMode: 'view',
    });

    setTemporaryValue(null);

    setInputDateTime('');

    persistDate(null);
  };

  const handleSubmit = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const datePickerWrapperRef = useRef<HTMLDivElement>(null);

  const [temporaryValue, setTemporaryValue] =
    useState<Nullable<Date>>(dateValue);

  const [inputDateTime, setInputDateTime] = useState(
    isDefined(dateValue) ? parseDateToString(dateValue) : '',
  );

  const handleVariableTagInsert = (variableName: string) => {
    setDraftValue({
      type: 'variable',
      value: variableName,
    });

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
                onFocus={() => {
                  setDraftValue({
                    type: 'static',
                    editingMode: 'edit',
                    value: draftValue.value,
                  });
                }}
                onChange={(event) => {
                  setInputDateTime(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') {
                    return;
                  }

                  const inputDateTimeTrimmed = inputDateTime.trim();

                  if (inputDateTimeTrimmed === '') {
                    handleClear();

                    return;
                  }

                  const d = parseStringToDate(inputDateTimeTrimmed);
                  if (isDefined(d)) {
                    setDraftValue({
                      type: 'static',
                      value: d.toDateString(),
                      editingMode: 'edit',
                    });

                    setTemporaryValue(d);

                    persistDate(d);
                  }
                }}
              />

              {draftValue.editingMode === 'edit' ? (
                <StyledDateInputContainer>
                  <div style={{ position: 'absolute' }}>
                    <DateInput
                      clearable
                      onChange={handleChange}
                      onEscape={handleEscape}
                      onClickOutside={handleClickOutside}
                      onEnter={handleEnter}
                      onClear={handleClear}
                      onSubmit={handleSubmit}
                      hideHeaderInput
                      wrapperRef={datePickerWrapperRef}
                      temporaryValue={temporaryValue}
                      setTemporaryValue={setTemporaryValue}
                    />
                  </div>
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
