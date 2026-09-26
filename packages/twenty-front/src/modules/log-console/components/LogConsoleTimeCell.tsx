import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { DATE_FORMAT_WITHOUT_YEAR } from '@/localization/constants/DateFormatWithoutYear';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { SettingsNameCellSecondaryLabel } from '@/settings/components/SettingsNameCellSecondaryLabel';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledTimeAndDate = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

type LogConsoleTimeCellProps = {
  timestamp: string;
};

export const LogConsoleTimeCell = ({ timestamp }: LogConsoleTimeCellProps) => {
  const timeZone = useLogConsoleTimeZone();
  const { dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const dayAndMonthFormat =
    DATE_FORMAT_WITHOUT_YEAR[getWorkspaceDateFormatFromDateFormat(dateFormat)];
  const timeWithMillisecondsFormat =
    timeFormat === TimeFormat.HOUR_12 ? 'h:mm:ss.SSS aa' : 'HH:mm:ss.SSS';

  const formatTimestamp = (format: string) =>
    formatInTimeZone(timestamp, timeZone, format, { locale: localeCatalog });

  return (
    <Tooltip
      content={beautifyPastDateRelativeToNow(timestamp, localeCatalog)}
      delay={TooltipDelay.mediumDelay}
    >
      <StyledTimeAndDate>
        {formatTimestamp(timeWithMillisecondsFormat)}
        <SettingsNameCellSecondaryLabel>
          {formatTimestamp(dayAndMonthFormat)}
        </SettingsNameCellSecondaryLabel>
      </StyledTimeAndDate>
    </Tooltip>
  );
};
