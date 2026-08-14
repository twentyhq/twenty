import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureModalInstanceId';
import { frontComponentMediaCaptureIsUploadingState } from '@/front-components/media-capture/states/frontComponentMediaCaptureIsUploadingState';
import { frontComponentMediaCaptureRequestState } from '@/front-components/media-capture/states/frontComponentMediaCaptureRequestState';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const FrontComponentMediaCaptureExternalCloseEffect = () => {
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
  const frontComponentMediaCaptureIsUploading = useAtomStateValue(
    frontComponentMediaCaptureIsUploadingState,
  );

  useEffect(() => {
    // The modal can be closed by actors outside the capture flow (e.g. a
    // global close-all). Resolve the pending request when that happens so a
    // stale lock cannot turn every later captureMedia call into a busy
    // failure until the next reload.
    // Not during upload though: consent and review are already done at that
    // point, and cancelling would strand the uploaded file — the settling
    // upload resolves the request as captured or upload-failed instead.
    if (
      isDefined(frontComponentMediaCaptureRequest) &&
      !isModalOpened &&
      !frontComponentMediaCaptureIsUploading
    ) {
      setFrontComponentMediaCaptureRequest(null);
      frontComponentMediaCaptureRequest.onResult({ status: 'cancelled' });
    }
  }, [
    frontComponentMediaCaptureRequest,
    isModalOpened,
    frontComponentMediaCaptureIsUploading,
    setFrontComponentMediaCaptureRequest,
  ]);

  return null;
};
