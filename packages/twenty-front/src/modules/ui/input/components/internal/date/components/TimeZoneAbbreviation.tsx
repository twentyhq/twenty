import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import styled from '@emotion/styled';

const StyledTimezoneAbbreviation = styled.span<{ hasError?: boolean }>`
  background: transparent;
  color: ${({ theme }) => theme.font.color.tertiary};

  font-size: ${({ theme }) => theme.font.size.sm};
  width: fit-content;

  user-select: none;

  line-height: 0.5px;
`;

export const TimeZoneAbbreviation = ({ date }: { date: Date }) => {
  const { isSystemTimezone, getTimezoneAbbreviationForPointInTime } =
    useUserTimezone();

  const shouldShowTimezoneAbbreviation = !isSystemTimezone;
  const timezoneSuffix = !isSystemTimezone
    ? ` ${getTimezoneAbbreviationForPointInTime(date ?? new Date())}`
    : '';

  if (!shouldShowTimezoneAbbreviation) {
    return <></>;
  }

  return (
    <StyledTimezoneAbbreviation>{timezoneSuffix}</StyledTimezoneAbbreviation>
  );
};
