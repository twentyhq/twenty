import { Module } from '@nestjs/common';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

@Module({
  providers: [SecretEncryptionService],
  exports: [SecretEncryptionService],
})
export class SecretEncryptionModule {}
