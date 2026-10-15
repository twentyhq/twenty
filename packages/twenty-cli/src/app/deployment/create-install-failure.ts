import { isDefined } from 'twenty-shared/utils';

import {
  type AppInstallOutcome,
  type AppInstallPhase,
} from '@/app/deployment/types/app-install-phase.type';
import { withPhaseDetails } from '@/app/deployment/with-phase-details';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';

const REJECTED_BEFORE_INSTALL_CODES = new Set<CliErrorCode>([
  'AUTH_REQUIRED',
  'PERMISSION_DENIED',
  'NOT_FOUND',
]);

const getOutcome = ({
  phase,
  code,
}: {
  phase: AppInstallPhase;
  code: CliErrorCode;
}): AppInstallOutcome => {
  if (
    phase === 'identity' ||
    (phase === 'start' && REJECTED_BEFORE_INSTALL_CODES.has(code))
  ) {
    return 'not-started';
  }

  if (code === 'INSTALL_FAILED') {
    return 'failed';
  }

  return 'unknown';
};

const getRecoveryHint = ({
  outcome,
  phase,
}: {
  outcome: AppInstallOutcome;
  phase: AppInstallPhase;
}) => {
  if (phase === 'identity') {
    return 'Fix the app source or identifier, then retry. No installation was started.';
  }

  if (outcome === 'not-started') {
    return 'Check the target workspace, registration and APPLICATIONS permission before retrying.';
  }

  return 'Run twenty app install again to retry or resume waiting for the current installation. Stopping the CLI does not cancel the server job.';
};

export const createInstallFailure = ({
  error,
  phase,
  completedPhases,
  universalIdentifier,
  jobId,
  signal,
}: {
  error: unknown;
  phase: AppInstallPhase;
  completedPhases: AppInstallPhase[];
  universalIdentifier?: string;
  jobId?: string;
  signal: AbortSignal;
}) => {
  const cliError = toCliError(error, signal);
  const outcome = getOutcome({ phase, code: cliError.code });

  return withPhaseDetails({
    error: new CliError({
      cause: cliError,
      code: cliError.code,
      exitCode: cliError.exitCode,
      message: cliError.message,
      hint: cliError.hint,
      details: {
        ...cliError.details,
        ...(isDefined(universalIdentifier) ? { universalIdentifier } : {}),
        ...(isDefined(jobId) ? { jobId } : {}),
      },
    }),
    phase,
    outcome,
    completedPhases,
    hint: getRecoveryHint({ outcome, phase }),
  });
};
