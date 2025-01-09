import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateString } from '~/utils/string/formatDateString';
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

  const formattedDate = formatDateString({
    value,
    displayAsRelativeDate,
    timeZone,
    dateFormat,
    timeFormat,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
