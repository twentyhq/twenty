import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';
import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
  dateFieldSettings?: FieldDateMetadataSettings;
};
export const DateDisplay = ({ value, dateFieldSettings }: DateDisplayProps) => {
  const { dateFormat } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { userTimezone } = useUserTimezone();

  const formattedDate = formatDateString({
    value,
    timeZone: userTimezone,
    dateFormat,
    dateFieldSettings,
    localeCatalog: dateLocale.localeCatalog,
  });

  return <EllipsisDisplay>{formattedDate}</EllipsisDisplay>;
};
