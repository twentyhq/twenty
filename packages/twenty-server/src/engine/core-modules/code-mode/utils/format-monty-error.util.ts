import { isNonEmptyString } from '@sniptt/guards';

import { type MontyModule } from 'src/engine/core-modules/code-mode/utils/load-monty-module.util';

export const formatMontyError = (
  error: unknown,
  montyModule: MontyModule,
): string => {
  if (error instanceof montyModule.MontyTypingError) {
    return `Type check failed, the script did not run:\n${error.display()}`;
  }

  if (
    error instanceof montyModule.MontySyntaxError ||
    error instanceof montyModule.MontyRuntimeError
  ) {
    return error.display('traceback');
  }

  if (error instanceof montyModule.MontyCrashedError) {
    const reason = error.timedOut ? ' after exceeding its time limit' : '';
    const exitStatus = isNonEmptyString(error.exitStatus)
      ? ` (${error.exitStatus})`
      : '';

    return `The script worker crashed${reason}${exitStatus}.`;
  }

  if (error instanceof montyModule.ProtocolError) {
    return `The script worker stopped responding: ${error.message}`;
  }

  return error instanceof Error ? error.message : String(error);
};
