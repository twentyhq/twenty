import { isDefined } from 'twenty-shared/utils';

import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';
import { isBubblingHostEvent } from '@/host/events/utils/isBubblingHostEvent';
import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventDispatchProperties = ({
  serializedEvent,
  hostEvent,
  findRemoteElementIdContainingNode,
}: {
  serializedEvent: SerializedEventData;
  hostEvent: HostEventDispatchFields;
  findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
}): void => {
  const relatedTargetRemoteElementId = findRemoteElementIdContainingNode?.(
    hostEvent.relatedTarget,
  );

  if (isDefined(relatedTargetRemoteElementId)) {
    serializedEvent.relatedTargetRemoteElementId = relatedTargetRemoteElementId;
  }

  if (!isBubblingHostEvent(hostEvent)) {
    return;
  }

  serializedEvent.bubbles = true;

  const targetRemoteElementId = findRemoteElementIdContainingNode?.(
    hostEvent.target,
  );

  if (isDefined(targetRemoteElementId)) {
    serializedEvent.targetRemoteElementId = targetRemoteElementId;
  }
};
