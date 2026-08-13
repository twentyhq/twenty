import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type CallRecordingTranscriptHeaderData } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptHeaderData';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const callRecordingTranscriptHeaderDataComponentFamilyState =
  createAtomComponentFamilyState<
    CallRecordingTranscriptHeaderData | null,
    string
  >({
    key: 'callRecordingTranscriptHeaderDataComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
