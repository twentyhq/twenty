export type CronDescriptionOptions = {
  verbose?: boolean;
  use24HourTimeFormat?: boolean;
  dayOfWeekStartIndexZero?: boolean;
  monthStartIndexZero?: boolean;
};

export const DEFAULT_CRON_DESCRIPTION_OPTIONS: CronDescriptionOptions = {
  verbose: false,
  use24HourTimeFormat: true, // Twenty uses 24-hour format by default
  dayOfWeekStartIndexZero: true,
  monthStartIndexZero: false,
};
