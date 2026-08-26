import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export type CallRecordingTranscriptHeaderData = {
  transcriptPlainText: string | undefined;
  videoFileUrl: string | undefined;
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
