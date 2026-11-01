import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type RoleManifest } from 'twenty-shared/application';

@InputType('TriggerInstallApplicationInput')
export class TriggerInstallApplicationInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  // The grant the admin customized at install; omitted, the grant is exactly what the app requests
  @IsOptional()
  @IsObject()
  @Field(() => GraphQLJSON, { nullable: true })
  grantRoleManifest?: RoleManifest;
}
