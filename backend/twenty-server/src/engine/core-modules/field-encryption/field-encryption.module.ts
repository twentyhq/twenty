import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FieldEncryptionKeyEntity, EncryptedFieldEntity } from './field-encryption.entity';
import { FieldEncryptionService } from './field-encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldEncryptionKeyEntity, EncryptedFieldEntity]),
  ],
  providers: [FieldEncryptionService],
  exports: [FieldEncryptionService],
})
export class FieldEncryptionModule {}