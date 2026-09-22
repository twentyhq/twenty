import { isDefined } from 'twenty-shared/utils';

import { EVENT_CLASS_NAME_BY_EVENT_TYPE } from '@/polyfills/events/constants/EventClassNameByEventType';
import { type WorkerEventConstructor } from '@/polyfills/events/types/WorkerEventConstructor';
import { isWorkerEventConstructor } from '@/polyfills/events/utils/isWorkerEventConstructor';
import { resolveBaseEventClass } from '@/polyfills/events/utils/resolveBaseEventClass';

type ResolveEventClassForEventTypeInput = {
  eventType: string;
  eventClassScope: Record<string, unknown>;
};

export const resolveEventClassForEventType = ({
  eventType,
  eventClassScope,
}: ResolveEventClassForEventTypeInput): WorkerEventConstructor => {
  const eventClassName = EVENT_CLASS_NAME_BY_EVENT_TYPE.get(eventType);
  const eventClass = isDefined(eventClassName)
    ? eventClassScope[eventClassName]
    : undefined;

  return isWorkerEventConstructor(eventClass)
    ? eventClass
    : resolveBaseEventClass(eventClassScope);
};
