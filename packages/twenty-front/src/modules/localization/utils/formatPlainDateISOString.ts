import { format, type Locale } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

export const formatPlainDateISOString = ({
  date,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  dateFormat: string;
  localeCatalog?: Locale;
}) => {
  const plainDate = Temporal.PlainDate.from(date);

  return format(
    new Date(plainDate.year, plainDate.month - 1, plainDate.day),
    dateFormat,
    { locale: localeCatalog },
  );
};
