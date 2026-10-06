import { isDefined } from 'twenty-shared/utils';

export const applySerializedEventRelatedTarget = ({
  event,
  relatedTarget,
}: {
  event: Event;
  relatedTarget: EventTarget | undefined;
}): void => {
  if (!isDefined(relatedTarget)) {
    return;
  }

  Object.defineProperty(event, 'relatedTarget', {
    value: relatedTarget,
    configurable: true,
    enumerable: true,
  });
};
