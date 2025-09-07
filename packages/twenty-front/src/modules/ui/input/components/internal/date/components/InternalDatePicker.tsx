import styled from '@emotion/styled';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import gregorian from 'react-date-object/calendars/gregorian';
import persian from 'react-date-object/calendars/persian';
import gregorianEn from 'react-date-object/locales/gregorian_en';
import persianFa from 'react-date-object/locales/persian_fa';
import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { isRtlLocale } from 'twenty-shared/utils';
import { IconCalendarX } from 'twenty-ui/display';
import { StyledHoverableMenuItemBase } from 'twenty-ui/navigation';

type DateTimePickerProps = {
  date: Date | null;
  onChange?: (date: Date | null) => void;
  onClose?: (date: Date | null) => void;
  clearable?: boolean;
  isDateTimeInput?: boolean;
  onClear?: () => void;
  onEnter?: (date: Date | null) => void;
  onEscape?: (date: Date | null) => void;
  keyboardEventsDisabled?: boolean;
  isRelative?: boolean;
  relativeDate?: unknown;
  onRelativeDateChange?: (value: unknown) => void;
  highlightedDateRange?: unknown;
  hideHeaderInput?: boolean;
};

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledContainer = styled.div`
  width: 280px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

const StyledButton = styled(StyledHoverableMenuItemBase)`
  width: 100%;
`;

export const DateTimePicker = ({
  date,
  onChange,
  onClose,
  clearable = true,
  isDateTimeInput,
  onClear,
}: DateTimePickerProps) => {
  const rtl = isRtlLocale(i18n.locale ?? '');
  const calendar = rtl ? persian : gregorian;
  const locale = rtl ? persianFa : gregorianEn;

  const handleChange = (value: any) => {
    const jsDate = Array.isArray(value)
      ? value[0]?.toDate?.()
      : value?.toDate?.();
    const parsed = jsDate ?? null;
    onChange?.(parsed);
    onClose?.(parsed);
  };

  return (
    <StyledContainer>
      <DatePicker
        value={date ?? undefined}
        calendar={calendar}
        locale={locale}
        onChange={handleChange}
        open
        plugins={isDateTimeInput ? [TimePicker] : []}
      />
      {clearable && (
        <StyledButtonContainer
          onClick={() => {
            onClear?.();
            onChange?.(null);
          }}
        >
          <StyledButton LeftIcon={IconCalendarX} text={t`Clear`} />
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};
