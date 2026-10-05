import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isDictationRecordingState = createAtomState<boolean>({
  key: 'ai/isDictationRecording',
  defaultValue: false,
});
