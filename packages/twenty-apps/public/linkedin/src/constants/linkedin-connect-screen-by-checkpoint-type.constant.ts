import { type LinkedinConnectScreen } from 'src/logic-functions/types/linkedin-connect-screen.type';

export const LINKEDIN_CONNECT_SCREEN_BY_CHECKPOINT_TYPE: Partial<
  Record<string, LinkedinConnectScreen>
> = {
  OTP: 'code',
  '2FA': 'code',
  OTP_OR_IN_APP_VALIDATION: 'code',
  IN_APP_VALIDATION: 'approval',
  LOADING: 'approval',
};
