import { StyledFormFieldInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputContainer';
import { StyledFormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputInputContainer';
import { StyledFormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/StyledFormFieldInputRowContainer';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { VariablePickerComponent } from '@/object-record/record-field/form-types/types/VariablePickerComponent';
import { DateInput } from '@/ui/field/input/components/DateInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useDateTimeInput } from '@/ui/input/components/internal/date/hooks/useDateTimeInput';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
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

    persistDate(newDate);
  };

  const handleEnter = (newDate: Nullable<Date>) => {
    setDraftValue({
      type: 'static',
      value: newDate?.toDateString() ?? null,
      editingMode: 'view',
    });

    setTemporaryValue(newDate);

    persistDate(newDate);
  };

  const handleEscape = (newDate: Nullable<Date>) => {
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

  const inputDateTimeDate = useMemo(() => dateValue ?? new Date(), [dateValue]);
  const {
    ref: dateInputRef,
    value: dateInputValue,
    hasError: dateInputHasError,
  } = useDateTimeInput({
    date: inputDateTimeDate,
    onChange: (newDate) => {
      setTemporaryValue(newDate);

      handleChange(newDate);
    },
  });

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
                // @ts-expect-error Type mismatch
                ref={dateInputRef}
                placeholder="Type date (mm/dd/yyyy)"
                value={dateInputValue}
                onFocus={() => {
                  setDraftValue({
                    type: 'static',
                    editingMode: 'edit',
                    value: draftValue.value,
                  });
                }}
                onChange={() => {}}
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
