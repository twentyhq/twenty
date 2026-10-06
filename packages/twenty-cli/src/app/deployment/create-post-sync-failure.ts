import { isNonEmptyString } from '@sniptt/guards';

import { type AppApplyPhase } from '@/app/deployment/types/app-apply-phase.type';
import { withPhaseDetails } from '@/app/deployment/with-phase-details';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';

type PostSyncPhase = Extract<AppApplyPhase, 'pullBase' | 'clientGeneration'>;

const POST_SYNC_STEPS: Record<
  PostSyncPhase,
  { cancelledMessage: string; failedMessage: string; hint: string }
> = {
  pullBase: {
    cancelledMessage: 'recording its pull base was cancelled',
    failedMessage: 'its pull base was not recorded',
    hint: 'The workspace already has this version of the app. Any previous pull base was kept. The typed API client was not regenerated. Review twenty app plan before retrying twenty app apply, which repeats the sync before recording the base and regenerating the client.',
  },
  clientGeneration: {
    cancelledMessage: 'generating its typed API client was cancelled',
    failedMessage: 'its typed API client was not regenerated',
    hint: 'The workspace already has this version of the app, but the client files in node_modules/twenty-client-sdk may be incomplete. Fix the problem, then run twenty app apply again: it repeats the preview, upload and sync before regenerating the client. twenty app plan shows what that sync would change.',
  },
};

export const createPostSyncFailure = ({
  error,
  phase,
  applicationName,
  apiUrl,
  completedPhases,
  signal,
}: {
  error: unknown;
  phase: PostSyncPhase;
  applicationName: string;
  apiUrl: string;
  completedPhases: AppApplyPhase[];
  signal: AbortSignal;
}) => {
  const cliError = toCliError(error, signal);
  const step = POST_SYNC_STEPS[phase];
  const message =
    cliError.code === 'CANCELLED'
      ? `${applicationName} was applied to ${apiUrl}, but ${step.cancelledMessage}.`
      : `${applicationName} was applied to ${apiUrl}, but ${step.failedMessage}: ${cliError.message}`;

  return withPhaseDetails({
    error: new CliError({
      code: cliError.code,
      exitCode: cliError.exitCode,
      message,
      hint: [step.hint, cliError.hint].filter(isNonEmptyString).join(' '),
      details: cliError.details,
    }),
    phase,
    outcome: 'applied',
    completedPhases,
    hint: step.hint,
  });
};
