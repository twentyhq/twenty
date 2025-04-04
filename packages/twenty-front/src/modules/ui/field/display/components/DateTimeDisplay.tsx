import { FieldDateDisplayFormat } from '@/object-record/record-field/types/FieldMetadata';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
  displayFormat?: FieldDateDisplayFormat;
};

export const DateTimeDisplay = ({
  value,
  displayFormat,
}: DateTimeDisplayProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const formattedDate = formatDateTimeString({
    value,
    displayFormat,
    timeZone,
    dateFormat,
    timeFormat,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
