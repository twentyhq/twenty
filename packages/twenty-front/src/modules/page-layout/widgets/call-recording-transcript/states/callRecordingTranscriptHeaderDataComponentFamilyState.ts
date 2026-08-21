import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export type CallRecordingTranscriptHeaderData = {
  callRecording: CalendarEventCallRecordingCandidate | undefined;
  callRecordingsCount: number;
};

export const callRecordingTranscriptHeaderDataComponentFamilyState =
  createAtomComponentFamilyState<
    CallRecordingTranscriptHeaderData | null,
    string
  >({
    key: 'callRecordingTranscriptHeaderDataComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
