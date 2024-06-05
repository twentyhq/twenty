import { formatISOStringToHumanReadableDate } from '~/utils/date-utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateDisplayProps = {
  value: string | null | undefined;
};

export const DateDisplay = ({ value }: DateDisplayProps) => (
  <EllipsisDisplay>
    {value ? formatISOStringToHumanReadableDate(value) : ''}
  </EllipsisDisplay>
);
