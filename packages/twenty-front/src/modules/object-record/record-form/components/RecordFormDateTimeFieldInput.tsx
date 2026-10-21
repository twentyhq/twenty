import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { useRecordFormDatePicker } from '@/object-record/record-form/hooks/useRecordFormDatePicker';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { FloatingPortal } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';

const RECORD_FORM_DATE_TIME_PICKER_CLICK_OUTSIDE_ID =
  'record-form-date-time-picker-floating';

const StyledDatePickerInputWrapper = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledDateInputTextContainer = styled.div<{ isReadonly?: boolean }>`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
  pointer-events: ${({ isReadonly }) => (isReadonly ? 'none' : 'auto')};
  user-select: ${({ isReadonly }) => (isReadonly ? 'none' : 'auto')};
  width: 100%;
`;

type RecordFormDateTimeFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  readonly?: boolean;
};

export const RecordFormDateTimeFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
}: RecordFormDateTimeFieldInputProps) => {
  const instanceId = useId();
  const { userTimezone } = useUserTimezone();

  const picker = useRecordFormDatePicker({
    instanceId,
    clickOutsideId: RECORD_FORM_DATE_TIME_PICKER_CLICK_OUTSIDE_ID,
  });

  const dateValue =
    !isNonEmptyString(defaultValue) || defaultValue === 'null'
      ? null
      : // Date and time syntax must stay stable across locales.
        defaultValue.includes(doNotTranslate('T'))
        ? Temporal.Instant.from(defaultValue).toZonedDateTimeISO(userTimezone)
        : Temporal.PlainDate.from(defaultValue).toZonedDateTime(userTimezone);

  const persistDate = (newDate: Nullable<Temporal.ZonedDateTime>) => {
    onChange(isDefined(newDate) ? newDate.toInstant().toString() : null);
  };

  const handleInputChange = (newDate: Temporal.ZonedDateTime | null) => {
    if (!isDefined(newDate)) {
      return;
    }

    picker.openPicker();
    persistDate(newDate);
  };

  const handlePickerClose = (newDate: Nullable<Temporal.ZonedDateTime>) => {
    picker.closePicker();
    persistDate(newDate);
  };

  const handlePickerClear = () => {
    picker.closePicker();
    onChange(null);
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <StyledDatePickerInputWrapper ref={picker.wrapperRef}>
          <FormFieldInputInnerContainer
            ref={picker.setReference}
            formFieldInputInstanceId={instanceId}
            enableGlobalEscapeHotkeysConflictingWithKeyboard={false}
            hasRightElement={false}
          >
            <StyledDateInputTextContainer
              isReadonly={readonly === true}
              onPointerDownCapture={readonly ? undefined : picker.openPicker}
            >
              <DateTimePickerInput
                date={dateValue}
                onChange={handleInputChange}
                onFocus={readonly ? undefined : picker.openPicker}
                readonly={readonly}
              />
            </StyledDateInputTextContainer>
          </FormFieldInputInnerContainer>
        </StyledDatePickerInputWrapper>
        {picker.isPickerOpen && !readonly ? (
          <FloatingPortal>
            <div
              data-floating-ui-viewport
              ref={picker.setFloating}
              style={picker.floatingStyles}
              data-click-outside-id={
                RECORD_FORM_DATE_TIME_PICKER_CLICK_OUTSIDE_ID
              }
            >
              <OverlayContainer>
                <ParentClickOutsideIdContext.Provider
                  value={RECORD_FORM_DATE_TIME_PICKER_CLICK_OUTSIDE_ID}
                >
                  <DateTimePicker
                    instanceId={instanceId}
                    date={dateValue}
                    onChange={persistDate}
                    onClose={handlePickerClose}
                    onEnter={() => {}}
                    onEscape={picker.closePicker}
                    onClear={handlePickerClear}
                    hideHeaderInput
                  />
                </ParentClickOutsideIdContext.Provider>
              </OverlayContainer>
            </div>
          </FloatingPortal>
        ) : null}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
