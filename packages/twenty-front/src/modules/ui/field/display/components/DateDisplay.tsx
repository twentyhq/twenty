import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
};

export const DateDisplay = ({ value }: DateDisplayProps) => {
  const { dateFormat, timeZone } = useContext(UserContext);

  const formattedDate = value
    ? formatDateISOStringToDate(value, timeZone, dateFormat)
    : '';

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
