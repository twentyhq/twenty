import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { dateLocaleStateV2 } from '~/localization/states/dateLocaleStateV2';
import { formatDateString } from '~/utils/string/formatDateString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
  dateFieldSettings?: FieldDateMetadataSettings;
};
export const DateDisplay = ({ value, dateFieldSettings }: DateDisplayProps) => {
  const { dateFormat } = useContext(UserContext);
  const dateLocale = useRecoilValueV2(dateLocaleStateV2);

  const formattedDate = formatDateString({
    value,
    timeZone: 'UTC', // Needed because we have db-stored date (yyyy-mm-dd) is converted to UTC dateTime by TypeORM
    dateFormat,
    dateFieldSettings,
    localeCatalog: dateLocale.localeCatalog,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
