import { useEffect } from 'react';
import { type CaptureMediaResult } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentMediaCaptureModal } from '@/front-components/media-capture/components/FrontComponentMediaCaptureModal';
import { FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureModalInstanceId';
import { frontComponentMediaCaptureRequestState } from '@/front-components/media-capture/states/frontComponentMediaCaptureRequestState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const FrontComponentMediaCaptureModalManager = () => {
  const frontComponentMediaCaptureRequest = useAtomStateValue(
    frontComponentMediaCaptureRequestState,
  );
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID,
  );
  const setFrontComponentMediaCaptureRequest = useSetAtomState(
    frontComponentMediaCaptureRequestState,
  );
  const { closeModal } = useModal();

  useEffect(() => {
    // The modal can be closed by actors outside the capture flow (e.g. a
    // global close-all). Resolve the pending request when that happens so a
    // stale lock cannot turn every later captureMedia call into a busy
    // failure until the next reload.
    if (isDefined(frontComponentMediaCaptureRequest) && !isModalOpened) {
      setFrontComponentMediaCaptureRequest(null);
      frontComponentMediaCaptureRequest.onResult({ status: 'cancelled' });
    }
  }, [
    frontComponentMediaCaptureRequest,
    isModalOpened,
    setFrontComponentMediaCaptureRequest,
  ]);

  if (!isDefined(frontComponentMediaCaptureRequest) || !isModalOpened) {
    return null;
  }

  const emitCaptureResult = (result: CaptureMediaResult) => {
    closeModal(FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID);
    setFrontComponentMediaCaptureRequest(null);
    frontComponentMediaCaptureRequest.onResult(result);
  };

  return (
    <FrontComponentMediaCaptureModal
      mediaCaptureRequest={frontComponentMediaCaptureRequest}
      onResult={emitCaptureResult}
    />
  );
};
