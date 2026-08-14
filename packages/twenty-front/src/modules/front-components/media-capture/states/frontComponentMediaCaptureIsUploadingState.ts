import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const frontComponentMediaCaptureIsUploadingState =
  createAtomState<boolean>({
    key: 'frontComponentMediaCaptureIsUploadingState',
    defaultValue: false,
  });
