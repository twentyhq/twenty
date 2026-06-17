import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTimezoneAbbreviation = styled.span<{ hasError?: boolean }>`
  background: transparent;
  color: ${themeCssVariables.font.color.tertiary};

  font-size: ${themeCssVariables.font.size.sm};
  user-select: none;

  width: fit-content;
`;

export const TimeZoneAbbreviation = ({
  instant,
  timeZone,
}: {
  instant: Temporal.Instant;
  timeZone?: string;
}) => {
  const { isSystemTimezone, userTimezone, systemTimeZone } = useUserTimezone();

  const zonedDate = instant.toZonedDateTimeISO(timeZone ?? userTimezone);

  const shouldUseParamsTimeZone =
    isNonEmptyString(timeZone) && systemTimeZone !== timeZone;

  const shouldShowTimezoneAbbreviation =
    !isSystemTimezone || shouldUseParamsTimeZone;

  const timezoneSuffix = shouldShowTimezoneAbbreviation
    ? ` ${getTimezoneAbbreviationForZonedDateTime(zonedDate)}`
    : '';

  if (!shouldShowTimezoneAbbreviation) {
    return <></>;
  }

  return (
    <StyledTimezoneAbbreviation>{timezoneSuffix}</StyledTimezoneAbbreviation>
  );
};
