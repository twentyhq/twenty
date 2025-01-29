import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { SectorTopic } from 'src/engine/core-modules/sector/types/SectorTopic';

@InputType()
export class UpdateSectorInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field(() => [GraphQLJSON], { nullable: true })
  @IsOptional()
  @IsArray()
  topics?: SectorTopic[];
}
