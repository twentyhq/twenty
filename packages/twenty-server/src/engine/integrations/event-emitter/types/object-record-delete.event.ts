import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

@ObjectType()
export class ObjectRecordDeleteEvent<T> extends ObjectRecordBaseEvent {
  @Field(() => GraphQLJSON)
  properties: {
    before: T;
  };
}
