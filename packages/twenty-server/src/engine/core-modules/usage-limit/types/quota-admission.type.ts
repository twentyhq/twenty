import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export type QuotaAdmission = {
  exhaustedScope: ExhaustedScope | null;
  hasUserAllowanceCounter: boolean;
  isUserAllowanceAvailable: boolean | null;
  isWorkspaceAllowanceAvailable: boolean | null;
};
