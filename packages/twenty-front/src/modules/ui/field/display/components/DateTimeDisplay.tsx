import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const formattedDate = value
    ? formatDateISOStringToDateTime(value, timeZone, dateFormat, timeFormat)
    : '';

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
