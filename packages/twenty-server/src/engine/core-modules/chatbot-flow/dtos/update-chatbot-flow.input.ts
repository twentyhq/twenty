import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsObject, IsString } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class UpdateChatbotFlowInput {
  @Field(() => graphqlTypeJson)
  @IsArray()
  @IsObject({ each: true })
  nodes: any[];

  @Field(() => graphqlTypeJson)
  @IsArray()
  @IsObject({ each: true })
  edges: any[];

  @Field()
  @IsString()
  chatbotId: string;
}
