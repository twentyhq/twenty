// What caused an SDK client generation. Emitted as a metric attribute so
// regeneration volume can be broken down by cause.
// 'unknown' covers jobs enqueued before the trigger field existed.
export type SdkClientGenerationTrigger =
  | 'workspace-activation'
  | 'manifest-sync'
  | 'missing-archive'
  | 'dev-seeder'
  | 'unknown';
