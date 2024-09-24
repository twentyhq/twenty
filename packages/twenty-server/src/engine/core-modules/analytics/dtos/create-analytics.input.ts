import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ArgsType()
export class CreateAnalyticsInput {
  @Field({ description: 'Type of the event' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field({ description: 'Session Id of the event' })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @Field(() => graphqlTypeJson, { description: 'Event data in JSON format' })
  @IsObject()
  data: JSON;
}
