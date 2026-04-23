export type CronExpressionParts = {
  seconds: string;
  minutes: string;
  hours: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year?: string;
};

export type CronFieldType =
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'dayOfMonth'
  | 'month'
  | 'dayOfWeek'
  | 'year';
