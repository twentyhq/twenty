export type CaptchaServerResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  'error-codes': string[];
};
