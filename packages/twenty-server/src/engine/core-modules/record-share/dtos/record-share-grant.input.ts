import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';

@InputType()
export class RecordShareGrantInput implements ShareWithInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  everyone?: boolean;

  @IsEnum(RecordShareAccessLevel)
  @Field(() => RecordShareAccessLevel)
  accessLevel: RecordShareAccessLevel;
}
