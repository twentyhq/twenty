import { CliError } from '@/output/cli-error';

export const withPhaseDetails = ({
  error,
  phase,
  outcome,
  completedPhases,
  hint,
}: {
  error: CliError;
  phase: string;
  outcome: string;
  completedPhases: string[];
  hint: string;
}) =>
  new CliError({
    cause: error,
    code: error.code,
    exitCode: error.exitCode,
    message: error.message,
    hint: error.hint ?? hint,
    details: {
      ...error.details,
      phase,
      outcome,
      completedPhases: [...completedPhases],
    },
  });
