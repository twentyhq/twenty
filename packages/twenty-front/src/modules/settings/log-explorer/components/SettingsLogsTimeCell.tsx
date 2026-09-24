import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useSettingsLogsTimeZone } from '@/settings/log-explorer/hooks/useSettingsLogsTimeZone';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  white-space: nowrap;
`;

const StyledMilliseconds = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type SettingsLogsTimeCellProps = {
  timestamp: string;
};

export const SettingsLogsTimeCell = ({
  timestamp,
}: SettingsLogsTimeCellProps) => {
  const timeZone = useSettingsLogsTimeZone();
  const { timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const isTwelveHourFormat = timeFormat === TimeFormat.HOUR_12;

  const formatTimestamp = (format: string) =>
    formatInTimeZone(timestamp, timeZone, format, { locale: localeCatalog });

  return (
    <Tooltip
      content={beautifyPastDateRelativeToNow(timestamp, localeCatalog)}
      delay={TooltipDelay.mediumDelay}
    >
      <StyledTime>
        {formatTimestamp(
          isTwelveHourFormat ? 'MMM d h:mm:ss' : 'MMM d HH:mm:ss',
        )}
        <StyledMilliseconds>{formatTimestamp('.SSS')}</StyledMilliseconds>
        {isTwelveHourFormat && formatTimestamp(' aa')}
      </StyledTime>
    </Tooltip>
  );
};
