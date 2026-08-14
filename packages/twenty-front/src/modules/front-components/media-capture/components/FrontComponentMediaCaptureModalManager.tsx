import { type CaptureMediaResult } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentMediaCaptureExternalCloseEffect } from '@/front-components/media-capture/components/FrontComponentMediaCaptureExternalCloseEffect';
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

  if (!isDefined(frontComponentMediaCaptureRequest) || !isModalOpened) {
    return <FrontComponentMediaCaptureExternalCloseEffect />;
  }

  const emitCaptureResult = (result: CaptureMediaResult) => {
    closeModal(FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID);
    setFrontComponentMediaCaptureRequest(null);
    frontComponentMediaCaptureRequest.onResult(result);
  };

  return (
    <>
      <FrontComponentMediaCaptureExternalCloseEffect />
      <FrontComponentMediaCaptureModal
        mediaCaptureRequest={frontComponentMediaCaptureRequest}
        onResult={emitCaptureResult}
      />
    </>
  );
};
