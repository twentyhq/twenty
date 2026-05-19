import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-registration-variable-rotation.handler';
import { ApplicationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-variable-rotation.handler';
import { ConnectedAccountTokensRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connected-account-tokens-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { SigningKeyPrivateKeysRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/signing-key-private-keys-rotation.handler';
import { TotpSecretsRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/totp-secrets-rotation.handler';
import { RotateSecretEncryptionCommand } from 'src/database/commands/secret-encryption-rotation/rotate-secret-encryption.command';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Module({
  imports: [
    SecretEncryptionModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature([
      ApplicationRegistrationVariableEntity,
      ApplicationVariableEntity,
      ConnectedAccountEntity,
      KeyValuePairEntity,
      SigningKeyEntity,
      TwoFactorAuthenticationMethodEntity,
    ]),
  ],
  providers: [
    ConnectedAccountTokensRotationHandler,
    ApplicationVariableRotationHandler,
    ApplicationRegistrationVariableRotationHandler,
    SigningKeyPrivateKeysRotationHandler,
    SensitiveConfigStorageRotationHandler,
    TotpSecretsRotationHandler,
    SecretEncryptionRotationRunnerService,
    RotateSecretEncryptionCommand,
  ],
  exports: [
    SecretEncryptionRotationRunnerService,
    RotateSecretEncryptionCommand,
  ],
})
export class SecretEncryptionRotationModule {}
