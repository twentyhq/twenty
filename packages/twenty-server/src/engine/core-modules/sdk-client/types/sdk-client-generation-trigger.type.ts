// What caused an SDK client generation. Emitted as a metric attribute so
// regeneration volume can be broken down by cause, e.g. to observe the
// incremental release-stale rollout after a deploy.
// 'unknown' covers jobs enqueued before the trigger field existed.
export type SdkClientGenerationTrigger =
  | 'workspace-activation'
  | 'manifest-sync'
  | 'release-stale'
  | 'missing-archive'
  | 'dev-seeder'
  | 'unknown';
