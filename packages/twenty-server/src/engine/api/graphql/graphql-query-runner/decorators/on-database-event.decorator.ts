import { OnEvent } from '@nestjs/event-emitter';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';

export function OnDatabaseEvent(
  object: string,
  action: DatabaseEventAction,
): MethodDecorator {
  const event = `${object}.${action}`;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    OnEvent(event)(target, propertyKey, descriptor);
  };
}
