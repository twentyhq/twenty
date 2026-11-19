const ARTIFACT_NAME_PATTERN =
  /^(conferenceRecords\/[^/]+)\/(?:transcripts|smartNotes|recordings)\/[^/]+$/;

export const getConferenceRecordNameFromArtifactName = (
  artifactName: string,
): string | undefined => ARTIFACT_NAME_PATTERN.exec(artifactName)?.[1];
