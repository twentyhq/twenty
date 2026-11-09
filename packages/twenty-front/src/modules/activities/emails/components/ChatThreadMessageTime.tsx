import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { themeCssVariables } from 'twenty-ui/theme';

// Floating keeps the time on the last text line when it fits, like chat apps do
const StyledTime = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  float: right;
  font-size: ${themeCssVariables.font.size.xs};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin-left: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

type ChatThreadMessageTimeProps = {
  receivedAt: string;
};

export const ChatThreadMessageTime = ({
  receivedAt,
}: ChatThreadMessageTimeProps) => {
  const { timeZone, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return (
    <StyledTime>
      {formatInTimeZone(new Date(receivedAt), timeZone, timeFormat, {
        locale: localeCatalog,
      })}
    </StyledTime>
  );
};
