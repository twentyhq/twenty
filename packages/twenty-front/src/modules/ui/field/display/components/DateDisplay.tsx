import { formatToHumanReadableDate } from '~/utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: Date | string | null | undefined;
};

export const DateDisplay = ({ value }: DateDisplayProps) => (
  <EllipsisDisplay>{value && formatToHumanReadableDate(value)}</EllipsisDisplay>
);
