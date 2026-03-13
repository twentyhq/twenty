import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useIMask } from 'react-imask';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { Select } from '@/ui/input/components/Select';
import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { useTimeInput } from '@/ui/input/components/internal/date/hooks/useTimeInput';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { getTimeBlocks } from '@/ui/input/components/internal/date/utils/getTimeBlocks';
import { getTimeMask } from '@/ui/input/components/internal/date/utils/getTimeMask';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from './DateTimePicker';

export const DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID =
  'date-time-picker-month-year-panel';

const YEARS_SELECT_OPTIONS = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 50 - i,
).map((year) => ({ label: year.toString(), value: year }));

const StyledTimeRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-start;
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledTimeInputWrapper = styled.div`
  flex-grow: 1;
`;

const StyledTimeInputContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[2]};
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledClockIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
`;

const StyledTimeInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  letter-spacing: 0.05em;
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledRightControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNavigationButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  height: 1px;
  width: 100%;
`;

const StyledMonthYearSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: 160px;
`;

type DateTimePickerHeaderProps = {
  date: Temporal.ZonedDateTime | null;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  hideInput?: boolean;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
};

export const DateTimePickerHeader = ({
  date,
  onChange,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  hideInput = false,
  onChangeMonth,
  onChangeYear,
}: DateTimePickerHeaderProps) => {
  const { timeFormat } = useDateTimeFormat();
  const { formatTime, parseTime, isHour12 } = useTimeInput(timeFormat);

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const { closeDropdown: closeMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeYearSelect } = useCloseDropdown();

  const closeInnerDropdowns = () => {
    closeMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
    closeYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
  };

  const { ref: iMaskRef, setValue } = useIMask(
    {
      mask: getTimeMask(timeFormat),
      blocks: getTimeBlocks(timeFormat),
      lazy: false,
      autofix: true,
    },
    {
      defaultValue: isDefined(date)
        ? formatTime(date.hour, date.minute)
        : undefined,
      onComplete: (value) => {
        if (!date) return;

        const parsedTime = parseTime(value);
        if (!parsedTime) {
          return;
        }

        onChange?.(
          date.with({ hour: parsedTime.hour, minute: parsedTime.minute }),
        );
      },
    },
  );

  useEffect(() => {
    if (isDefined(date)) {
      setValue(formatTime(date.hour, date.minute));
    }
  }, [date, formatTime, setValue]);

  const timeInputRef = iMaskRef as React.Ref<HTMLInputElement>;

  return (
    <>
      {!hideInput && (
        <>
          <DateTimePickerInput date={date} onChange={onChange} />
          <StyledSeparator />
        </>
      )}
      <StyledTimeRow>
        <StyledTimeInputWrapper>
          <StyledTimeInputContainer>
            <StyledClockIcon>
              <IconClock size={16} />
            </StyledClockIcon>
            <StyledTimeInput
              type="text"
              ref={timeInputRef}
              placeholder={isHour12 ? 'HH:mm AA' : 'HH:mm'}
            />
          </StyledTimeInputContainer>
        </StyledTimeInputWrapper>
        <StyledRightControls>
          <Dropdown
            dropdownId={DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID}
            clickableComponent={
              <LightIconButton
                Icon={IconCalendar}
                size="medium"
                aria-label={t`Select month and year`}
              />
            }
            dropdownPlacement="bottom-start"
            dropdownOffset={{ y: 8 }}
            onClose={closeInnerDropdowns}
            excludedClickOutsideIds={[
              MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
              MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
            ]}
            dropdownComponents={
              <StyledMonthYearSelector>
                <ClickOutsideListenerContext.Provider
                  value={{
                    excludedClickOutsideId:
                      MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
                  }}
                >
                  <Select
                    dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
                    options={getMonthSelectOptions(userLocale)}
                    onChange={onChangeMonth}
                    value={date?.month}
                    fullWidth={false}
                    dropdownWidth={160}
                  />
                </ClickOutsideListenerContext.Provider>
                <ClickOutsideListenerContext.Provider
                  value={{
                    excludedClickOutsideId:
                      MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
                  }}
                >
                  <Select
                    dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
                    onChange={onChangeYear}
                    value={date?.year}
                    options={YEARS_SELECT_OPTIONS}
                    fullWidth={false}
                    dropdownWidth={160}
                  />
                </ClickOutsideListenerContext.Provider>
              </StyledMonthYearSelector>
            }
          />
          <StyledNavigationButtons>
            <LightIconButton
              Icon={IconChevronLeft}
              onClick={onSubtractMonth}
              size="medium"
              disabled={prevMonthButtonDisabled}
            />
            <LightIconButton
              Icon={IconChevronRight}
              onClick={onAddMonth}
              size="medium"
              disabled={nextMonthButtonDisabled}
            />
          </StyledNavigationButtons>
        </StyledRightControls>
      </StyledTimeRow>
    </>
  );
};
