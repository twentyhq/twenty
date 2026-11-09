import { type HttpEgressRejection } from 'src/engine/core-modules/http-egress/types/http-egress-rejection.type';

export type HttpEgressAdmission = {
  rejection: HttpEgressRejection | null;
  // When false, a rejection is only logged and the request still runs.
  isEnforced: boolean;
  release: () => Promise<void>;
};
