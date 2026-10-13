import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export type QuotaAdmission = {
  exhaustedScope: ExhaustedScope | null;
  hasMemberCounter: boolean;
  isMemberAllowanceAvailable: boolean | null;
  isWorkspaceAllowanceAvailable: boolean | null;
};
