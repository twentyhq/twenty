import {
  type CaptureMediaMediaType,
  type CaptureMediaResult,
} from 'twenty-front-component-renderer';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type FrontComponentMediaCaptureRequest = {
  // Resolves the requesting application's name in the consent modal.
  applicationId: string;
  mediaType: CaptureMediaMediaType;
  fieldMetadataId: string;
  maxDurationSeconds: number;
  onResult: (result: CaptureMediaResult) => void;
};

export const frontComponentMediaCaptureRequestState =
  createAtomState<FrontComponentMediaCaptureRequest | null>({
    key: 'frontComponentMediaCaptureRequestState',
    defaultValue: null,
  });
