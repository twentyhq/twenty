import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class ApiKeyTokenInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  apiKeyId: string;

  @Field(() => String)
  @IsNotEmpty()
  expiresAt: string;
}
