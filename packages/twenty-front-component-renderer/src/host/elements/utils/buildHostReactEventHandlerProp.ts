import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';
import { type HostReactEventHandlerProp } from '@/host/elements/types/HostReactEventHandlerProp';
import { isRemoteEventListenerActive } from '@/host/elements/utils/isRemoteEventListenerActive';
import { LOWERCASE_EVENT_PROP_TO_DOM_EVENT_TYPE } from '@/host/events/constants/LowercaseEventPropToDomEventType';
import { type RemoteSerializedEventListener } from '@/host/events/types/RemoteSerializedEventListener';
import { wrapEventHandler } from '@/host/events/utils/wrapEventHandler';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';

export const buildHostReactEventHandlerProp = ({
  remoteProps,
  remotePropName,
  remotePropValue,
  findRemoteElementIdContainingNode,
}: {
  remoteProps: Record<string, unknown>;
  remotePropName: string;
  remotePropValue: unknown;
  findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
}): HostReactEventHandlerProp | undefined => {
  const domEventType =
    LOWERCASE_EVENT_PROP_TO_DOM_EVENT_TYPE[remotePropName.toLowerCase()];

  if (
    !isDefined(domEventType) ||
    !isFunction(remotePropValue) ||
    !isRemoteEventListenerActive({ remoteProps, domEventType })
  ) {
    return undefined;
  }

  return {
    reactPropName: DOM_EVENT_TYPE_TO_REACT_PROP[domEventType],
    hostEventHandler: wrapEventHandler({
      remoteListener: remotePropValue as RemoteSerializedEventListener,
      findRemoteElementIdContainingNode,
    }),
  };
};
