import { isFunction, isNonEmptyString } from '@sniptt/guards';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type RemoteEventHandler } from '@/host/types/RemoteEventHandler';
import { type RequestExternalNavigation } from '@/host/types/RequestExternalNavigation';
import { isExternalNavigationUrl } from '@/host/utils/isExternalNavigationUrl';

const PRIMARY_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;

type CreateAnchorNavigationClickHandlerParams = {
  href: unknown;
  target: unknown;
  remoteOnClick: unknown;
  requestExternalNavigation: RequestExternalNavigation | null;
};

export const createAnchorNavigationClickHandler =
  ({
    href,
    target,
    remoteOnClick,
    requestExternalNavigation,
  }: CreateAnchorNavigationClickHandlerParams) =>
  (event: MouseEvent<HTMLAnchorElement>) => {
    const clickCanOpenNavigation =
      event.button === PRIMARY_MOUSE_BUTTON ||
      event.button === MIDDLE_MOUSE_BUTTON;

    if (
      isDefined(requestExternalNavigation) &&
      clickCanOpenNavigation &&
      isNonEmptyString(href) &&
      isExternalNavigationUrl(href)
    ) {
      event.preventDefault();

      const clickRequestsSeparateBrowsingContext =
        event.button === MIDDLE_MOUSE_BUTTON ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey;

      const anchorTarget = isNonEmptyString(target) ? target : undefined;

      requestExternalNavigation({
        url: new URL(href, window.location.href).href,
        target: clickRequestsSeparateBrowsingContext ? '_blank' : anchorTarget,
      });

      return;
    }

    const clickIsPrimaryActivation = event.button === PRIMARY_MOUSE_BUTTON;

    if (clickIsPrimaryActivation && isFunction(remoteOnClick)) {
      (remoteOnClick as RemoteEventHandler)(event);
    }
  };
