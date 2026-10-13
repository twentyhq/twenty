import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';

export type UsageAdmission = {
  refusal: UsageRefusal | null;
  hasMemberCounter: boolean;
  isMemberAllowanceAvailable: boolean | null;
  isWorkspaceAllowanceAvailable: boolean | null;
};
