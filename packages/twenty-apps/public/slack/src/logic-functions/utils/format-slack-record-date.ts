import { readSlackRecordText } from 'src/logic-functions/utils/read-slack-record-text';

export const formatSlackRecordDate = (value: unknown): string | undefined => {
  const dateValue = value instanceof Date ? value : readSlackRecordText(value);

  if (dateValue === undefined) {
    return undefined;
  }

  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const isCurrentYear = date.getUTCFullYear() === new Date().getUTCFullYear();

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  }).format(date);
};
