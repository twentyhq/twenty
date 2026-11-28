import { type InteractiveConnectionStepResult } from 'twenty-shared/application';

export type InteractiveConnectionReportedAccount = Omit<
  Extract<InteractiveConnectionStepResult, { type: 'done' }>,
  'type'
>;
