import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useIMask } from 'react-imask';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { Select } from '@/ui/input/components/Select';
import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { DateTimePickerTimeValueEffect } from '@/ui/input/components/internal/date/components/DateTimePickerTimeValueEffect';
import { useTimeInput } from '@/ui/input/components/internal/date/hooks/useTimeInput';
import { getDatePickerDropdownIds } from '@/ui/input/components/internal/date/utils/getDatePickerDropdownIds';
import { DATE_PICKER_YEAR_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/DatePickerYearSelectOptions';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { getTimeBlocks } from '@/ui/input/components/internal/date/utils/getTimeBlocks';
import { getTimeMask } from '@/ui/input/components/internal/date/utils/getTimeMask';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Field, Input, InputGroup } from 'twenty-ui/primitives/input';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const TIME_INPUT_ICON_SIZE = 16;

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
  instanceId: string;
  date: Temporal.ZonedDateTime | null;
  viewedMonth: string;
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
  instanceId,
  date,
  viewedMonth,
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
  const displayedMonth = Temporal.PlainYearMonth.from(viewedMonth);
  const formattedTime = isDefined(date)
    ? formatTime(date.hour, date.minute)
    : undefined;

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const {
    monthSelectDropdownId,
    yearSelectDropdownId,
    monthYearPanelDropdownId,
  } = getDatePickerDropdownIds(instanceId);

  const { ref: iMaskRef, setValue } = useIMask<HTMLInputElement>(
    {
      mask: getTimeMask(timeFormat),
      blocks: getTimeBlocks(timeFormat),
      lazy: false,
      autofix: true,
    },
    {
      defaultValue: formattedTime,
      onComplete: (value) => {
        if (!isDefined(date)) {
          return;
        }

        const parsedTime = parseTime(value);
        if (!isDefined(parsedTime)) {
          return;
        }

        onChange?.(
          date.with({ hour: parsedTime.hour, minute: parsedTime.minute }),
        );
      },
    },
  );

  return (
    <>
      {isDefined(formattedTime) && (
        <DateTimePickerTimeValueEffect
          value={formattedTime}
          setValue={setValue}
        />
      )}
      {!hideInput && (
        <>
          <DateTimePickerInput date={date} onChange={onChange} />
          <StyledSeparator />
        </>
      )}
      <StyledTimeRow>
        <Field.Root render={<StyledTimeInputWrapper />}>
          <InputGroup startElement={<IconClock size={TIME_INPUT_ICON_SIZE} />}>
            <Input
              type="text"
              ref={iMaskRef}
              placeholder={doNotTranslate(isHour12 ? 'HH:mm AA' : 'HH:mm')}
              aria-label={t`Time`}
            />
          </InputGroup>
        </Field.Root>
        <StyledRightControls>
          <DropdownRoot dropdownId={monthYearPanelDropdownId} type="panel">
            <Dropdown.Trigger
              render={
                <LightIconButton
                  size="md"
                  aria-label={t`Select month and year`}
                >
                  <IconCalendar />
                </LightIconButton>
              }
            />
            <DropdownContent
              align="start"
              sideOffset={8}
              width={170}
              initialFocus={false}
            >
              <StyledMonthYearSelector>
                <Select
                  dropdownId={monthSelectDropdownId}
                  options={getMonthSelectOptions(userLocale)}
                  onChange={onChangeMonth}
                  value={displayedMonth.month}
                  fullWidth={false}
                  dropdownWidth={160}
                />
                <Select
                  dropdownId={yearSelectDropdownId}
                  onChange={onChangeYear}
                  value={displayedMonth.year}
                  options={DATE_PICKER_YEAR_SELECT_OPTIONS}
                  fullWidth={false}
                  dropdownWidth={160}
                />
              </StyledMonthYearSelector>
            </DropdownContent>
          </DropdownRoot>
          <StyledNavigationButtons>
            <LightIconButton
              onClick={onSubtractMonth}
              size="md"
              disabled={prevMonthButtonDisabled}
              aria-label={t`Previous`}
            >
              <IconChevronLeft />
            </LightIconButton>
            <LightIconButton
              onClick={onAddMonth}
              size="md"
              disabled={nextMonthButtonDisabled}
              aria-label={t`Next`}
            >
              <IconChevronRight />
            </LightIconButton>
          </StyledNavigationButtons>
        </StyledRightControls>
      </StyledTimeRow>
    </>
  );
};
