// Remove once deployed Call Recorder manifests no longer synchronize these jobs.
export const CALL_RECORDER_APPLICATION_UNIVERSAL_IDENTIFIER =
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617';

export const CALL_RECORDER_SPREAD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS =
  new Set([
    'd7d1170f-abb1-4c9b-8258-13219a611b03',
    'e362aa9b-52c6-4b7e-bb20-927e0e8d7cbe',
  ]);

export const CALL_RECORDER_CRON_SPREAD_SECONDS_BY_PATTERN = new Map([
  ['*/5 * * * *', 4 * 60],
  ['*/15 * * * *', 14 * 60],
]);
