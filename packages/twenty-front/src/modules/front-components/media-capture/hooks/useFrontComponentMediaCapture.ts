import { useStore } from 'jotai';
import { type CaptureMediaResult } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureModalInstanceId';
import {
  type FrontComponentMediaCaptureRequest,
  frontComponentMediaCaptureRequestState,
} from '@/front-components/media-capture/states/frontComponentMediaCaptureRequestState';
import { normalizeMediaCaptureMaxDurationSeconds } from '@/front-components/media-capture/utils/normalizeMediaCaptureMaxDurationSeconds';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useFrontComponentMediaCapture = () => {
  const store = useStore();
  const setFrontComponentMediaCaptureRequest = useSetAtomState(
    frontComponentMediaCaptureRequestState,
  );
  const { openModal } = useModal();

  const requestMediaCapture = (
    request: Omit<
      FrontComponentMediaCaptureRequest,
      'onResult' | 'maxDurationSeconds'
    > & { maxDurationSeconds?: number },
  ): Promise<CaptureMediaResult> => {
    const pendingMediaCaptureRequest = store.get(
      frontComponentMediaCaptureRequestState.atom,
    );

    if (isDefined(pendingMediaCaptureRequest)) {
      return Promise.resolve({ status: 'failed', reason: 'busy' });
    }

    // getUserMedia only exists in secure contexts; without it the capture
    // modal could never record anything, so fail before showing it.
    if (
      !window.isSecureContext ||
      !isDefined(navigator.mediaDevices?.getUserMedia)
    ) {
      return Promise.resolve({ status: 'failed', reason: 'blocked' });
    }

    return new Promise<CaptureMediaResult>((resolve) => {
      setFrontComponentMediaCaptureRequest({
        ...request,
        maxDurationSeconds: normalizeMediaCaptureMaxDurationSeconds(
          request.maxDurationSeconds,
        ),
        onResult: resolve,
      });
      openModal(FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID);
    });
  };

  return { requestMediaCapture };
};
