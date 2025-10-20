import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsInt,
  IsNotIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RESERVED_SUBDOMAINS } from 'src/engine/core-modules/workspace/constants/reserved-subdomains.constant';

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(/^(?!api-).*^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/)
  @IsNotIn(RESERVED_SUBDOMAINS)
  subdomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
  )
  customDomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  inviteHash?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublicInviteLinkEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowImpersonation?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isGoogleAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isMicrosoftAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPasswordAuthEnabled?: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  defaultRoleId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isTwoFactorAuthenticationEnforced?: boolean;

  @Field({ nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  trashRetentionDays?: number;
}
