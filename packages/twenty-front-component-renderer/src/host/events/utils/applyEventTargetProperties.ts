import { isPlainObject } from 'twenty-shared/utils';

import { applyFormControlTargetProperties } from '@/host/events/utils/applyFormControlTargetProperties';
import { applyMediaTargetProperties } from '@/host/events/utils/applyMediaTargetProperties';
import { applyScrollTargetProperties } from '@/host/events/utils/applyScrollTargetProperties';
import { type SerializedEventData } from '@/types/SerializedEventData';

export const applyEventTargetProperties = ({
  serializedEvent,
  target,
  includesFormControlState,
  includesScrollState,
}: {
  serializedEvent: SerializedEventData;
  target: unknown;
  includesFormControlState: boolean;
  includesScrollState: boolean;
}): void => {
  if (!isPlainObject(target)) {
    return;
  }

  if (includesFormControlState) {
    applyFormControlTargetProperties({ serializedEvent, target });
  }

  if (includesScrollState) {
    applyScrollTargetProperties({ serializedEvent, target });
  }

  applyMediaTargetProperties({ serializedEvent, target });
};
