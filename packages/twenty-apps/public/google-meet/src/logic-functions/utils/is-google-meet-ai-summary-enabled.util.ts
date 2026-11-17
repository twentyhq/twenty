import { GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME } from 'src/constants/google-meet.constant';

export const isGoogleMeetAiSummaryEnabled = (): boolean =>
  process.env[GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME] !== 'false';
