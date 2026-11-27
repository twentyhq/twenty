export const INTERACTIVE_CONNECTION_LIMITS = {
  flowTtlMilliseconds: 15 * 60 * 1000,
  maxSubmitCount: 30,
  minPollIntervalSeconds: 2,
  maxPollIntervalSeconds: 60,
  maxFieldCount: 10,
  maxValueLength: 4096,
  maxTextLength: 500,
  maxQrCodeDataLength: 4096,
  maxStateBytes: 16 * 1024,
} as const;
