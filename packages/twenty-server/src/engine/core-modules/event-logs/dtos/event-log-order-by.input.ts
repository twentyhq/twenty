import { Field, InputType, registerEnumType } from '@nestjs/graphql';

export enum EventLogOrderByField {
  TIMESTAMP = 'timestamp',
  EVENT = 'event',
}

registerEnumType(EventLogOrderByField, {
  name: 'EventLogOrderByField',
});

export enum EventLogOrderByDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(EventLogOrderByDirection, {
  name: 'EventLogOrderByDirection',
});

@InputType()
export class EventLogOrderByInput {
  @Field(() => EventLogOrderByField, {
    defaultValue: EventLogOrderByField.TIMESTAMP,
  })
  field: EventLogOrderByField;

  @Field(() => EventLogOrderByDirection, {
    defaultValue: EventLogOrderByDirection.DESC,
  })
  direction: EventLogOrderByDirection;
}
