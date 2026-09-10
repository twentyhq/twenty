import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateMessageSuppressionInput {
  @Field(() => String)
  @IsEmail()
  emailAddress: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID('4')
  unsubscribeTopicId?: string;
}
