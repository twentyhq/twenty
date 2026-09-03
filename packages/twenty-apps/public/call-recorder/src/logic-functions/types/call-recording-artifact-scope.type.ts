// 'all' is the reconcile sweep, which imports both halves in one pass.
export type CallRecordingArtifactScope = 'transcript' | 'media' | 'all';

export type CallRecordingArtifactImportScope = Exclude<
  CallRecordingArtifactScope,
  'all'
>;
