// Transcript and media are imported by separate jobs holding separate leases, so
// a slow media upload cannot bounce a transcript callback. 'all' is the reconcile
// sweep's single-pass scope.
export type CallRecordingArtifactScope = 'transcript' | 'media' | 'all';

export type CallRecordingArtifactImportScope = Exclude<
  CallRecordingArtifactScope,
  'all'
>;
