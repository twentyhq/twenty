import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { getTimezoneAbbreviationForZonedDateTime } from '@/ui/input/components/internal/date/utils/getTimeZoneAbbreviationForZonedDateTime';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { type Temporal } from 'temporal-polyfill';

const StyledTimezoneAbbreviation = styled.span<{ hasError?: boolean }>`
  background: transparent;
  color: ${({ theme }) => theme.font.color.tertiary};

  font-size: ${({ theme }) => theme.font.size.sm};
  width: fit-content;

  user-select: none;
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
