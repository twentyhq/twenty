import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationEntity])],
  providers: [
    ApplicationLookupService,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [ApplicationLookupService],
})
export class ApplicationLookupModule {}
