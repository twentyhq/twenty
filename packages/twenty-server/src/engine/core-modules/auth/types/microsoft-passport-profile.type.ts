import { type Profile } from 'passport';

export type MicrosoftPassportProfile = Profile & {
  userPrincipalName?: string;
};
