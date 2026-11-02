import { ArgsType, Field } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class ExportApplicationInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  universalIdentifier: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  shouldIncludeDependencies?: boolean;
}
