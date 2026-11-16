import { formatInTimeZone } from 'date-fns-tz';
import { Text } from 'twenty-ui/primitives/typography';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type ChatMessageTimeProps = {
  date: Date | string;
};

export const ChatMessageTime = ({ date }: ChatMessageTimeProps) => {
  const { timeZone, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  return (
    <Text
      render={<time dateTime={new Date(date).toISOString()} />}
      size="sm"
      color="tertiary"
    >
      {formatInTimeZone(date, timeZone, timeFormat, { locale: localeCatalog })}
    </Text>
  );
};
