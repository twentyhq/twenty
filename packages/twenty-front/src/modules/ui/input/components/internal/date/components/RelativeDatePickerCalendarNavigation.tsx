import { t } from '@lingui/core/macro';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  monthLabelDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
};

export const RelativeDatePickerCalendarNavigation = ({
  monthLabelDate,
  onPreviousMonth,
  onNextMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: RelativeDatePickerCalendarNavigationProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const monthYearLabel = new Intl.DateTimeFormat(userLocale, {
    month: 'long',
    year: 'numeric',
  }).format(monthLabelDate);

  return (
    <StyledContainer>
      <LightIconButton
        onClick={onPreviousMonth}
        size="md"
        disabled={prevMonthButtonDisabled}
        aria-label={t`Previous`}
      >
        <IconChevronLeft />
      </LightIconButton>
      <StyledMonthYearLabel>{monthYearLabel}</StyledMonthYearLabel>
      <LightIconButton
        onClick={onNextMonth}
        size="md"
        disabled={nextMonthButtonDisabled}
        aria-label={t`Next`}
      >
        <IconChevronRight />
      </LightIconButton>
    </StyledContainer>
  );
};
