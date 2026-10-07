import {
  type AppApplyOutcome,
  type AppApplyPhase,
} from '@/app/deployment/types/app-apply-phase.type';
import { type AppUploadProgress } from '@/app/deployment/types/app-upload-progress.type';
import { withPhaseDetails } from '@/app/deployment/with-phase-details';
import { toCliError } from '@/output/to-cli-error';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';

const REJECTED_BEFORE_EXECUTION_CODES = new Set<CliErrorCode>([
  'AUTH_REQUIRED',
  'PERMISSION_DENIED',
]);

const LOCAL_FAILURE_CODES = new Set<CliErrorCode>([
  'SNAPSHOT_INVALID',
  'TOOLING_UNSUPPORTED',
]);

const getOutcome = ({
  phase,
  code,
  upload,
}: {
  phase: AppApplyPhase;
  code: CliErrorCode;
  upload: AppUploadProgress;
}): AppApplyOutcome => {
  if (phase === 'build' || phase === 'preview' || phase === 'confirmation') {
    return 'not-started';
  }

  if (phase === 'upload' && upload.fileCount > 0) {
    return 'partial';
  }

  if (phase === 'upload' && upload.hasCreatedTargets) {
    return 'unknown';
  }

  if (
    REJECTED_BEFORE_EXECUTION_CODES.has(code) ||
    LOCAL_FAILURE_CODES.has(code)
  ) {
    return 'not-started';
  }

  return 'unknown';
};

const getRecoveryHint = ({
  phase,
  outcome,
}: {
  phase: AppApplyPhase;
  outcome: AppApplyOutcome;
}) => {
  if (outcome === 'not-started') {
    return 'Fix the problem, then run twenty app apply again. It rebuilds the app and requests a fresh plan.';
  }

  return `The ${phase} step may have changed the workspace. Run twenty app plan to see where it stands before applying again.`;
};

export const createApplyFailure = ({
  error,
  phase,
  completedPhases,
  upload,
  signal,
}: {
  error: unknown;
  phase: AppApplyPhase;
  completedPhases: AppApplyPhase[];
  upload: AppUploadProgress;
  signal: AbortSignal;
}) => {
  const cliError = toCliError(error, signal);
  const outcome = getOutcome({ phase, code: cliError.code, upload });

  return withPhaseDetails({
    error: cliError,
    phase,
    outcome,
    completedPhases,
    hint: getRecoveryHint({ phase, outcome }),
  });
};
