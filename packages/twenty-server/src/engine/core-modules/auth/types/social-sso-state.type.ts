import { type APP_LOCALES } from 'twenty-shared/translations';

import { type SocialSsoSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';

export type SocialSsoState = {
  workspaceInviteHash?: string;
  workspaceId?: string;
  billingCheckoutSessionState?: string;
  workspacePersonalInviteToken?: string;
  action?: SocialSsoSignInUpActionType;
  locale?: keyof typeof APP_LOCALES;
};
