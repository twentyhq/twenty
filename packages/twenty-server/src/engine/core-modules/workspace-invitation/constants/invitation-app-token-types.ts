import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';

export const INVITATION_APP_TOKEN_TYPES: readonly AppTokenType[] = [
  AppTokenType.InvitationToken,
  AppTokenType.OnboardingInvitationToken,
];
