import { isDefined } from 'twenty-shared/utils';

import { type FindRemoteElementIdContainingNode } from '@/host/geometry/types/FindRemoteElementIdContainingNode';
import { type HostEventDispatchFields } from '@/host/events/types/HostEventDispatchFields';
import { isBubblingHostEvent } from '@/host/events/utils/isBubblingHostEvent';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventDispatchProperties = ({
  serialized,
  hostEvent,
  findRemoteElementIdContainingNode,
}: {
  serialized: SerializedEventData;
  hostEvent: HostEventDispatchFields;
  findRemoteElementIdContainingNode?: FindRemoteElementIdContainingNode;
}): void => {
  const relatedTargetRemoteElementId = findRemoteElementIdContainingNode?.(
    hostEvent.relatedTarget,
  );

  if (isDefined(relatedTargetRemoteElementId)) {
    serialized.relatedTargetRemoteElementId = relatedTargetRemoteElementId;
  }

  if (!isBubblingHostEvent(hostEvent)) {
    return;
  }

  serialized.bubbles = true;

  const targetRemoteElementId = findRemoteElementIdContainingNode?.(
    hostEvent.target,
  );

  if (isDefined(targetRemoteElementId)) {
    serialized.targetRemoteElementId = targetRemoteElementId;
  }
};
