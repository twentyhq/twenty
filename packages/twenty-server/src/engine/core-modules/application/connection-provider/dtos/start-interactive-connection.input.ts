import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('StartInteractiveConnectionInput')
export class StartInteractiveConnectionInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  providerName: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  reconnectingConnectedAccountId?: string;
}
