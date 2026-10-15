import { isDefined } from 'twenty-shared/utils';

export const formatProgressLine = ({
  message,
  percentage,
}: {
  message: string;
  percentage?: number;
}) => (isDefined(percentage) ? `${message} ${percentage}%` : message);
