import { useRecoilValue } from 'recoil';

import { dateTimeFormatState } from '@/workspace-member/states/dateTimeFormatState';
import { formatDatetimeMemoized } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => {
  const dateTimeFormat = useRecoilValue(dateTimeFormatState);

  return (
    <EllipsisDisplay>
      {value &&
        formatDatetimeMemoized(
          value,
          dateTimeFormat.timeZone,
          dateTimeFormat.dateFormat,
          dateTimeFormat.timeFormat,
        )}
    </EllipsisDisplay>
  );
};
