import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class DismissReconnectAccountBannerInput {
  @Field(() => UUIDScalarType)
  @IsString()
  @IsNotEmpty()
  connectedAccountId: string;
}
