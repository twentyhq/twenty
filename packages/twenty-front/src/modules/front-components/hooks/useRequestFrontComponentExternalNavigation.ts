import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type RequestExternalNavigation } from 'twenty-front-component-renderer';

import { FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID } from '@/front-components/constants/FrontComponentExternalLinkModalId';
import { frontComponentExternalLinkModalConfigState } from '@/front-components/states/frontComponentExternalLinkModalConfigState';
import { trustedFrontComponentExternalOriginsState } from '@/front-components/states/trustedFrontComponentExternalOriginsState';
import { openExternalUrl } from '@/front-components/utils/openExternalUrl';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useRequestFrontComponentExternalNavigation = ({
  applicationId,
}: {
  applicationId: string;
}): RequestExternalNavigation => {
  const jotaiStore = useStore();
  const setFrontComponentExternalLinkModalConfig = useSetAtomState(
    frontComponentExternalLinkModalConfigState,
  );
  const { openModal } = useModal();

  return useCallback(
    ({ url, target }) => {
      const origin = new URL(url).origin;

      const trustedFrontComponentExternalOrigins = jotaiStore.get(
        trustedFrontComponentExternalOriginsState.atom,
      );

      const applicationTrustsOrigin =
        trustedFrontComponentExternalOrigins[applicationId]?.includes(origin) ??
        false;

      if (applicationTrustsOrigin) {
        openExternalUrl(url, target);
        return;
      }

      setFrontComponentExternalLinkModalConfig({
        applicationId,
        url,
        origin,
        target,
      });
      openModal(FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID);
    },
    [
      applicationId,
      jotaiStore,
      setFrontComponentExternalLinkModalConfig,
      openModal,
    ],
  );
};
