import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateString } from '~/utils/string/formatDateString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
  displayFormat?: FieldDateDisplayFormat;
};

export const DateDisplay = ({
  value,
  displayFormat,
}: DateDisplayProps) => {
  const { dateFormat, timeZone } = useContext(UserContext);

  const formattedDate = formatDateString({
    value,
    timeZone,
    dateFormat,
    displayFormat,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
