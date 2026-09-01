import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

export type WidgetCallRecordingCandidate = {
  __typename: 'CallRecording';
  id: string;
  transcript?: unknown;
  summary?: { markdown: string | null } | null;
  video?: FieldFilesValue[] | null;
};
