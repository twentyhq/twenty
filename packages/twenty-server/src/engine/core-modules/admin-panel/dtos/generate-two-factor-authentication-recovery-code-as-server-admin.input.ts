import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { GenerateTwoFactorAuthenticationRecoveryCodeInput } from 'src/engine/core-modules/two-factor-authentication/dto/generate-two-factor-authentication-recovery-code.input';

@ArgsType()
export class GenerateTwoFactorAuthenticationRecoveryCodeAsServerAdminInput extends GenerateTwoFactorAuthenticationRecoveryCodeInput {
  @Field(() => UUIDScalarType)
  @IsNotEmpty()
  @IsUUID()
  workspaceId: string;
}
