import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

@ObjectType()
export class TestHttpRequestOutput {
  @Field(() => Boolean, {
    description: 'Whether the request was successful',
  })
  success: boolean;

  @Field(() => String, {
    description: 'Message describing the result',
  })
  message: string;

  @Field(() => graphqlTypeJson, {
    description: 'Response data',
    nullable: true,
  })
  result?: object;

  @Field(() => graphqlTypeJson, {
    description: 'Error information',
    nullable: true,
  })
  error?: string;
}
