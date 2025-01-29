import { Field, ID, InputType } from '@nestjs/graphql';

import { IsArray, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { SectorTopic } from 'src/engine/core-modules/sector/types/SectorTopic';

@InputType()
export class CreateSectorInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  icon: string;

  @Field(() => [GraphQLJSON], { nullable: true })
  @IsArray()
  topics?: SectorTopic[];

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}
