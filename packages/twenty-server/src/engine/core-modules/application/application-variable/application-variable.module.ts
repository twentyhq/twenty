import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { ApplicationVariableEntityResolver } from 'src/engine/core-modules/application/application-variable/application-variable.resolver';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { FlatApplicationVariableModule } from 'src/engine/metadata-modules/flat-application-variable/flat-application-variable.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationVariableEntity]),
    PermissionsModule,
    WorkspaceCacheModule,
    SecretEncryptionModule,
    FlatApplicationVariableModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(ApplicationVariableEntity),
    ApplicationVariableEntityService,
    ApplicationVariableEntityResolver,
  ],
  exports: [ApplicationVariableEntityService],
})
export class ApplicationVariableEntityModule {}
