import { formatToHumanReadableDateTime } from '~/utils';

import { EllipsisDisplay } from './EllipsisDisplay';

type DateTimeDisplayProps = {
  value: Date | string | null | undefined;
};

export const DateTimeDisplay = ({ value }: DateTimeDisplayProps) => (
  <EllipsisDisplay>
    {value && formatToHumanReadableDateTime(value)}
  </EllipsisDisplay>
);
