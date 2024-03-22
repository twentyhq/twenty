import { ArgsType, Field } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

@ArgsType()
export class CreateAnalyticsInput {
  @Field({ description: 'Type of the event' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field(() => graphqlTypeJson, { description: 'Event data in JSON format' })
  @IsObject()
  data: JSON;
}
