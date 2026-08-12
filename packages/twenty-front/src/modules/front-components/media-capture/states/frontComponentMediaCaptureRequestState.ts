import {
  type CaptureMediaMediaType,
  type CaptureMediaResult,
} from 'twenty-front-component-renderer';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type FrontComponentMediaCaptureRequest = {
  frontComponentId: string;
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
