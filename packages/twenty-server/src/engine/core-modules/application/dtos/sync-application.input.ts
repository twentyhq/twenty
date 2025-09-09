import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import { ApplicationManifest } from 'src/engine/core-modules/application/types/application-manifest.type';

@InputType()
export class SyncApplicationInput {
  @Field(() => GraphQLJSON)
  @IsNotEmpty()
  @IsObject()
  manifest: ApplicationManifest;
}
