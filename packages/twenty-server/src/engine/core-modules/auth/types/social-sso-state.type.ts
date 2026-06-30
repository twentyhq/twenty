import { type APP_LOCALES } from 'twenty-shared/translations';

import { type SocialSSOSignInUpActionType } from 'src/engine/core-modules/auth/types/signInUp.type';

export type SocialSSOState = {
  workspaceInviteHash?: string;
  workspaceId?: string;
  billingCheckoutSessionState?: string;
  action?: SocialSSOSignInUpActionType;
  locale?: keyof typeof APP_LOCALES;
  returnToPath?: string;
};
