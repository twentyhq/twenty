import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateString } from '~/utils/string/formatDateString';
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

  const formattedDate = formatDateString({
    value,
    timeZone,
    dateFormat,
    displayAsRelativeDate,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
