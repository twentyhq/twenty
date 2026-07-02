import { WORKSPACE_ACTIVATION_MESSAGES } from '@/auth/sign-in-up/constants/WorkspaceActivationMessages';
import { msg } from '@lingui/core/macro';

export const ONBOARDING_ACTIVATION_MESSAGES = [
  msg`Verifying your login token`,
  ...WORKSPACE_ACTIVATION_MESSAGES,
];
