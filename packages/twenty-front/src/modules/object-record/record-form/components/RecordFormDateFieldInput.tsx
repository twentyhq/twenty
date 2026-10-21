import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { useRecordFormDatePicker } from '@/object-record/record-form/hooks/useRecordFormDatePicker';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { FloatingPortal } from '@floating-ui/react';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId } from 'react';
import { Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const RECORD_FORM_DATE_PICKER_CLICK_OUTSIDE_ID =
  'record-form-date-picker-floating';

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

  & input {
    color: ${({ isReadonly }) =>
      isReadonly
        ? themeCssVariables.font.color.light
        : themeCssVariables.font.color.primary};
  }
`;

type RecordFormDateFieldInputProps = {
  label?: string;
  defaultValue?: string | null;
  onChange: (value: string | null) => void;
  readonly?: boolean;
};

export const RecordFormDateFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
}: RecordFormDateFieldInputProps) => {
  const instanceId = useId();
  const { userTimezone } = useUserTimezone();

  const picker = useRecordFormDatePicker({
    instanceId,
    clickOutsideId: RECORD_FORM_DATE_PICKER_CLICK_OUTSIDE_ID,
  });

  const plainDateValue =
    !isNonEmptyString(defaultValue) || defaultValue === 'null'
      ? null
      : // Date and time syntax must stay stable across locales.
        defaultValue.includes(doNotTranslate('T'))
        ? Temporal.Instant.from(defaultValue)
            .toZonedDateTimeISO(userTimezone)
            .toPlainDate()
            .toString()
        : Temporal.PlainDate.from(defaultValue).toString();

  const handleInputChange = (newDate: string | null) => {
    if (!isDefined(newDate)) {
      return;
    }

    picker.openPicker();
    onChange(newDate);
  };

  const handlePickerClose = (newDate: Nullable<string>) => {
    picker.closePicker();
    onChange(newDate ?? null);
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
              <DatePickerInput
                date={plainDateValue}
                onChange={handleInputChange}
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
              data-click-outside-id={RECORD_FORM_DATE_PICKER_CLICK_OUTSIDE_ID}
            >
              <OverlayContainer>
                <DatePicker
                  instanceId={instanceId}
                  plainDateString={plainDateValue}
                  onChange={(newDate) => onChange(newDate ?? null)}
                  onClose={handlePickerClose}
                  onEnter={() => {}}
                  onEscape={picker.closePicker}
                  onClear={handlePickerClear}
                  hideHeaderInput
                />
              </OverlayContainer>
            </div>
          </FloatingPortal>
        ) : null}
      </FormFieldInputRowContainer>
    </FormFieldInputContainer>
  );
};
