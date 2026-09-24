import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { DATE_FORMAT_WITHOUT_YEAR } from '@/localization/constants/DateFormatWithoutYear';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-family: ${themeCssVariables.code.font.family};
  white-space: nowrap;
`;

const StyledMilliseconds = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type LogConsoleTimeCellProps = {
  timestamp: string;
};

export const LogConsoleTimeCell = ({ timestamp }: LogConsoleTimeCellProps) => {
  const timeZone = useLogConsoleTimeZone();
  const { dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const isTwelveHourFormat = timeFormat === TimeFormat.HOUR_12;

  const dayAndMonthFormat =
    DATE_FORMAT_WITHOUT_YEAR[getWorkspaceDateFormatFromDateFormat(dateFormat)];
  const timeWithSecondsFormat = isTwelveHourFormat ? 'h:mm:ss' : 'HH:mm:ss';

  const formatTimestamp = (format: string) =>
    formatInTimeZone(timestamp, timeZone, format, { locale: localeCatalog });

  return (
    <Tooltip
      content={beautifyPastDateRelativeToNow(timestamp, localeCatalog)}
      delay={TooltipDelay.mediumDelay}
    >
      <StyledTime>
        {formatTimestamp(`${dayAndMonthFormat} ${timeWithSecondsFormat}`)}
        <StyledMilliseconds>{formatTimestamp('.SSS')}</StyledMilliseconds>
        {isTwelveHourFormat && formatTimestamp(' aa')}
      </StyledTime>
    </Tooltip>
  );
};
