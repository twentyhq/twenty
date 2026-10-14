import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import { styled } from '@linaria/react';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme';

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
  instant: Temporal.Instant | string;
  timeZone?: string;
}) => {
  const { isSystemTimezone, userTimezone, systemTimeZone } = useUserTimezone();

  const shouldUseParamsTimeZone =
    isNonEmptyString(timeZone) && systemTimeZone !== timeZone;

  const shouldShowTimezoneAbbreviation =
    !isSystemTimezone || shouldUseParamsTimeZone;

  if (!shouldShowTimezoneAbbreviation) {
    return <></>;
  }

  const zonedDate = (
    isString(instant) ? Temporal.Instant.from(instant) : instant
  ).toZonedDateTimeISO(timeZone ?? userTimezone);

  return (
    <StyledTimezoneAbbreviation>
      {` ${getTimezoneAbbreviationForZonedDateTime(zonedDate)}`}
    </StyledTimezoneAbbreviation>
  );
};
