import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableFileService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable-file.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    ApplicationRegistrationLookupModule,
    TypeOrmModule.forFeature([
      ApplicationRegistrationVariableEntity,
      ApplicationRegistrationEntity,
      ApplicationEntity,
      FileEntity,
    ]),
    SecretEncryptionModule,
    FileStorageModule,
    FileUploadModule,
    FileUrlModule,
  ],
  providers: [
    ApplicationRegistrationVariableService,
    ApplicationRegistrationVariableFileService,
    provideWorkspaceScopedRepository(FileEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [
    ApplicationRegistrationVariableService,
    ApplicationRegistrationVariableFileService,
  ],
})
export class ApplicationRegistrationVariableModule {}
