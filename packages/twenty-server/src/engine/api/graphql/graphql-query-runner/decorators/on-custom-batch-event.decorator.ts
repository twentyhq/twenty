import { OnEvent } from '@nestjs/event-emitter';

export function OnCustomBatchEvent(event: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    OnEvent(event)(target, propertyKey, descriptor);
  };
}
