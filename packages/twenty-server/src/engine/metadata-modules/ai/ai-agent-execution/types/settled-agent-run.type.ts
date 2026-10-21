import { type RunAgentResult } from 'twenty-shared/application';

export type SettledAgentRun = Pick<
  RunAgentResult,
  'status' | 'result' | 'error'
>;
