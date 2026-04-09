import { OnEvent } from '@nestjs/event-emitter';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

export function OnDatabaseBatchEvent(
  object: string,
  action: DatabaseEventAction,
): MethodDecorator {
  const event = `${object}.${action}`;

  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    OnEvent(event)(target, propertyKey, descriptor);
  };
}
