import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
  displayAsRelativeDate?: boolean;
};

export const DateDisplay = ({
  value,
  displayAsRelativeDate,
}: DateDisplayProps) => {
  const { dateFormat, timeZone } = useContext(UserContext);

  const formattedDate = value
    ? displayAsRelativeDate
      ? formatDateISOStringToRelativeDate(value, true)
      : formatDateISOStringToDate(value, timeZone, dateFormat)
    : '';

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
