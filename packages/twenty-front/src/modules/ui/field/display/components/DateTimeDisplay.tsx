import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
  displayAsRelativeDate?: boolean;
};

export const DateTimeDisplay = ({
  value,
  displayAsRelativeDate,
}: DateTimeDisplayProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const formattedDate = formatDateTimeString({
    value,
    displayAsRelativeDate,
    timeZone,
    dateFormat,
    timeFormat,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
