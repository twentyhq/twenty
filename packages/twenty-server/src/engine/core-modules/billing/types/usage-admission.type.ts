import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';

export type UsageAdmission = {
  refusal: UsageRefusal | null;
  hasUserAllowanceCounter: boolean;
  hasUserCreditsLeft: boolean;
  hasWorkspaceCreditsLeft: boolean;
};
