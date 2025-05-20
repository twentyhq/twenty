import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateString } from '~/utils/string/formatDateString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
  dateFieldSettings?: FieldDateMetadataSettings;
};
export const DateDisplay = ({ value, dateFieldSettings }: DateDisplayProps) => {
  const { dateFormat, dateFnsLocale } = useContext(UserContext);
  const formattedDate = formatDateString({
    value,
    timeZone: 'UTC', // Needed because we have db-stored date (yyyy-mm-dd) is converted to UTC dateTime by TypeORM
    dateFormat,
    dateFieldSettings,
    locale: dateFnsLocale,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
