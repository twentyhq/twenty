import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMonthYearLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  text-align: center;
`;

type RelativeDatePickerCalendarNavigationProps = {
  monthLabelDate: Temporal.PlainDate;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export const RelativeDatePickerCalendarNavigation = ({
  monthLabelDate,
  onPreviousMonth,
  onNextMonth,
}: RelativeDatePickerCalendarNavigationProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;
  const { calendarSystem } = useDateTimeFormat();

  const monthYearLabel = new Intl.DateTimeFormat(userLocale, {
    month: 'long',
    year: 'numeric',
    calendar: calendarSystem,
  }).format(
    new Date(monthLabelDate.year, monthLabelDate.month - 1, monthLabelDate.day),
  );

  return (
    <StyledContainer>
      <LightIconButton
        onClick={onPreviousMonth}
        size="md"
        aria-label={t`Previous`}
      >
        <IconChevronLeft />
      </LightIconButton>
      <StyledMonthYearLabel>{monthYearLabel}</StyledMonthYearLabel>
      <LightIconButton onClick={onNextMonth} size="md" aria-label={t`Next`}>
        <IconChevronRight />
      </LightIconButton>
    </StyledContainer>
  );
};
