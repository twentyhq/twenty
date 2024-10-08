import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ArgsType()
export class CreateAnalyticsInput {
  @Field({ description: 'Type of the event' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @Field(() => graphqlTypeJson, { description: 'Event payload in JSON format' })
  @IsObject()
  payload: JSON;
}
