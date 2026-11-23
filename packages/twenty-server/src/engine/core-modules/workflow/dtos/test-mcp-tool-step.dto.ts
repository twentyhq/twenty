import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

@ObjectType('TestMcpToolStep')
export class TestMcpToolStepDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => graphqlTypeJson, {
    description: 'What the tool returned, saved as the step output sample',
    nullable: true,
  })
  result?: object;

  @Field(() => String, { nullable: true })
  error?: string;
}
