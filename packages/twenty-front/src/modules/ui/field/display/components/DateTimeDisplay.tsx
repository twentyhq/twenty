import { FieldDateMetadataSettings } from '@/object-record/record-field/types/FieldMetadata';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: string | null | undefined;
  dateFieldSettings?: FieldDateMetadataSettings;
};

export const DateTimeDisplay = ({
  value,
  dateFieldSettings,
}: DateTimeDisplayProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const formattedDate = formatDateTimeString({
    value,
    timeZone,
    dateFormat,
    timeFormat,
    dateFieldSettings,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
