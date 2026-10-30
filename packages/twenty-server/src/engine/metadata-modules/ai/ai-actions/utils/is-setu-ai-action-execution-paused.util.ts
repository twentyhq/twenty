// Server-wide kill switch, independent of the presentation flags: queued
// actions and research steps stay queued and nothing new is claimed while it
// is set. Review, reject, cancel and task status keep working.
export const SETU_AI_ACTIONS_EXECUTION_PAUSED_VARIABLE =
  'SETU_AI_ACTIONS_EXECUTION_PAUSED';

export const isSetuAiActionExecutionPaused = (
  environment: NodeJS.ProcessEnv = process.env,
): boolean => environment[SETU_AI_ACTIONS_EXECUTION_PAUSED_VARIABLE] === 'true';
