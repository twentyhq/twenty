import { type HttpEgressOutcome } from 'src/engine/core-modules/http-egress/types/http-egress-outcome.type';

export type HttpEgressDiagnostics = {
  outcome: HttpEgressOutcome;
  status?: number;
  resolvedAddress?: string;
  durationMs: number;
};
