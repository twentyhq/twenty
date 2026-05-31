import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES } from 'src/database/commands/secret-encryption-rotation/constants/secret-encryption-rotation-site-entries.constant';
import { ConnectionParametersRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connection-parameters-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { RotateSecretEncryptionCommand } from 'src/database/commands/secret-encryption-rotation/rotate-secret-encryption.command';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

const ROTATION_ENTITIES = [
  ...Object.values(SECRET_ENCRYPTION_ROTATION_SITE_ENTRIES).map(
    (entry) => entry.entity,
  ),
  KeyValuePairEntity,
];

@Module({
  imports: [
    SecretEncryptionModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature(ROTATION_ENTITIES),
  ],
  providers: [
    ConnectionParametersRotationHandler,
    SensitiveConfigStorageRotationHandler,
    SecretEncryptionRotationRunnerService,
    RotateSecretEncryptionCommand,
  ],
  exports: [
    SecretEncryptionRotationRunnerService,
    RotateSecretEncryptionCommand,
  ],
})
export class SecretEncryptionRotationModule {}
