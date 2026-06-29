import { ArgsType, Field } from '@nestjs/graphql';

import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class SendInvitationsInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayUnique()
  emails: string[];

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  roleId?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isOnboardingInvitation?: boolean;
}
