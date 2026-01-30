import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum EventLogOrderByField {
  TIMESTAMP = 'timestamp',
  EVENT = 'event',
  USER_ID = 'userId',
}

registerEnumType(EventLogOrderByField, {
  name: 'EventLogOrderByField',
  description: 'Fields available for ordering event logs',
});

export enum EventLogOrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(EventLogOrderByDirection, {
  name: 'EventLogOrderByDirection',
  description: 'Order direction for event logs',
});

@InputType()
export class EventLogOrderByInput {
  @Field(() => EventLogOrderByField, { defaultValue: EventLogOrderByField.TIMESTAMP })
  field: EventLogOrderByField;

  @Field(() => EventLogOrderByDirection, { defaultValue: EventLogOrderByDirection.DESC })
  direction: EventLogOrderByDirection;
}
