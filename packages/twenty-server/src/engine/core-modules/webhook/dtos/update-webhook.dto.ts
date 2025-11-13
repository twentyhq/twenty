import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWebhookInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  targetUrl?: string;

  @Field(() => [String], { nullable: true })
  operations?: string[];

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  secret?: string;
}
