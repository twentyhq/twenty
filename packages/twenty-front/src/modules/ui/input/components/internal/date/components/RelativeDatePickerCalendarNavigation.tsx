import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMonthYearLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-align: center;
`;

type RelativeDatePickerCalendarNavigationProps = {
  calendarViewDate: string;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
};

export const RelativeDatePickerCalendarNavigation = ({
  calendarViewDate,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: RelativeDatePickerCalendarNavigationProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const plainDate = Temporal.PlainDate.from(calendarViewDate);

  const monthYearLabel = new Intl.DateTimeFormat(userLocale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(plainDate.year, plainDate.month - 1, plainDate.day));

  return (
    <>
      <LightIconButton
        Icon={IconChevronLeft}
        onClick={onSubtractMonth}
        size="medium"
        disabled={prevMonthButtonDisabled}
      />
      <StyledMonthYearLabel>{monthYearLabel}</StyledMonthYearLabel>
      <LightIconButton
        Icon={IconChevronRight}
        onClick={onAddMonth}
        size="medium"
        disabled={nextMonthButtonDisabled}
      />
    </>
  );
};
