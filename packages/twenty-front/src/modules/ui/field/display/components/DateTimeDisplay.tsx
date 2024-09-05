import { formatDateISOStringToDateTime } from '@/localization/utils/formatDateISOStringToDateTime';
import { formatDateISOStringToRelativeDate } from '@/localization/utils/formatDateISOStringToRelativeDate';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
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

  const formattedDate = value
    ? displayAsRelativeDate
      ? formatDateISOStringToRelativeDate(value)
      : formatDateISOStringToDateTime(value, timeZone, dateFormat, timeFormat)
    : '';

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
