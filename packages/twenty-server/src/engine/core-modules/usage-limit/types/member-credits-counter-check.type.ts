import { type CreditCounterCheck } from 'src/engine/core-modules/usage-limit/types/credit-counter-check.type';

export type MemberCreditsCounterCheck = CreditCounterCheck & {
  userWorkspaceId: string;
};
