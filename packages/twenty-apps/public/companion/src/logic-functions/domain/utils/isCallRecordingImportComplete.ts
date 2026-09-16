import { isCallRecordingMediaImportComplete } from 'src/logic-functions/domain/utils/isCallRecordingMediaImportComplete';

export const isCallRecordingImportComplete = ({
  transcript,
  ...media
}: Parameters<typeof isCallRecordingMediaImportComplete>[0] & {
  transcript: unknown;
}): boolean =>
  Array.isArray(transcript) && isCallRecordingMediaImportComplete(media);
