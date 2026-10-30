import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

// The projection travels as JSON validated against the shared contract, so
// the review card and the server read one versioned shape.
@ObjectType('AiActionState')
export class AiActionStateDTO {
  @Field(() => String)
  requestedId: string;

  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  action: Record<string, unknown> | null;
}
