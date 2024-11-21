import { OnEvent } from '@nestjs/event-emitter';

import { CustomEventName } from 'src/engine/workspace-event-emitter/types/custom-event-name.type';

export function OnCustomBatchEvent(event: CustomEventName): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    OnEvent(event)(target, propertyKey, descriptor);
  };
}
