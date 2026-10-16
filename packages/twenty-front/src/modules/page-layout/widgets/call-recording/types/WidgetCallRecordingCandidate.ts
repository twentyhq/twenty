import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type CallRecordingStatus } from 'twenty-shared/types';

export type WidgetCallRecordingCandidate = {
  __typename: 'CallRecording';
  id: string;
  status: CallRecordingStatus;
  transcript?: unknown;
  summary?: { markdown: string | null } | null;
  video?: FieldFilesValue[] | null;
  audio?: FieldFilesValue[] | null;
};
