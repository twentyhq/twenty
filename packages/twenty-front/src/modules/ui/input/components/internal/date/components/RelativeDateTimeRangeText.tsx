import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconArrowDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-height: 96px;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
  text-align: center;
`;

const StyledBound = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type RelativeDateTimeRangeTextProps = {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export const RelativeDateTimeRangeText = ({
  start,
  end,
}: RelativeDateTimeRangeTextProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const formatter = new Intl.DateTimeFormat(userLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: start.timeZoneId,
  });

  return (
    <StyledContainer>
      <StyledBound>{formatter.format(new Date(start.epochMilliseconds))}</StyledBound>
      <IconArrowDown size={14} color={themeCssVariables.font.color.tertiary} />
      <StyledBound>{formatter.format(new Date(end.epochMilliseconds))}</StyledBound>
    </StyledContainer>
  );
};
