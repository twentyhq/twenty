import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('ConnectApplicationWithApiKeyInput')
export class ConnectApplicationWithApiKeyInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  providerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  @Field()
  apiKey: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  reconnectingConnectedAccountId?: string;
}
