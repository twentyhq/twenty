import type { StepOutcome } from 'src/modules/resend/sync/types/step-outcome';
import type { SyncStepResult } from 'src/modules/resend/sync/types/sync-step-result';
import {
  runSyncStep,
  skipDueToFailedDeps,
} from 'src/modules/resend/sync/utils/run-sync-step';
import type { SegmentIdMap } from 'src/modules/resend/sync/utils/sync-segments';

export type SyncResendDeps = {
  syncSegments: () => Promise<SyncStepResult<SegmentIdMap>>;
  syncTemplates: () => Promise<SyncStepResult>;
  syncContacts: () => Promise<SyncStepResult>;
  syncEmails: () => Promise<SyncStepResult>;
  syncBroadcasts: (segmentMap: SegmentIdMap) => Promise<SyncStepResult>;
};

export const orchestrateSyncResend = async (
  deps: SyncResendDeps,
): Promise<ReadonlyArray<StepOutcome<unknown>>> => {
  const [segments, templates, contacts, emails] = await Promise.all([
    runSyncStep('segments', deps.syncSegments),
    runSyncStep('templates', deps.syncTemplates),
    runSyncStep('contacts', deps.syncContacts),
    runSyncStep('emails', deps.syncEmails),
  ]);

  const broadcasts =
    segments.status === 'ok'
      ? await runSyncStep('broadcasts', () => deps.syncBroadcasts(segments.value))
      : skipDueToFailedDeps('broadcasts', { segments });

  return [segments, templates, contacts, emails, broadcasts];
};
