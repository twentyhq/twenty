import { EllipsisDisplayV2 } from '@/ui/field/display/components/EllipsisDisplayV2';

type DateTimeDisplayV2Props = {
  value: string;
};

const monthsForLocale = () => {
  const format = new Intl.DateTimeFormat(undefined, { month: 'long' }).format;
  return [...Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, (m + 1) % 12))),
  );
};

const months = monthsForLocale();

export const DateTimeDisplayV2 = ({ value }: DateTimeDisplayV2Props) => {
  const date = value.split('T')[0];
  const time = value.split('T')[1].split('.')[0];

  const dateParts = date.split('-');
  const timeParts = time.split(':');

  const year = dateParts[0];
  const month = months[parseInt(dateParts[1])];
  const day = dateParts[2];

  const hour = timeParts[0];
  const minute = timeParts[1];

  const dateFormatted = `${day} ${month} ${year} ${hour}:${minute}`;

  return <EllipsisDisplayV2>{dateFormatted}</EllipsisDisplayV2>;
};
