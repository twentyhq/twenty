import { Module } from '@nestjs/common';

import { ApplicationRegistrationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-registration-variable-rotation.handler';
import { ApplicationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-variable-rotation.handler';
import { ConnectedAccountTokensRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connected-account-tokens-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { SigningKeyPrivateKeysRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/signing-key-private-keys-rotation.handler';
import { TotpSecretsRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/totp-secrets-rotation.handler';
import { RotateSecretEncryptionCommand } from 'src/database/commands/secret-encryption-rotation/rotate-secret-encryption.command';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [SecretEncryptionModule, TwentyConfigModule],
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
