import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionResolver } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.resolver';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationVersionEntity,
      FileEntity,
    ]),
    FileUrlModule,
  ],
  providers: [
    ApplicationRegistrationVersionService,
    ApplicationRegistrationVersionResolver,
  ],
  exports: [ApplicationRegistrationVersionService],
})
export class ApplicationRegistrationVersionModule {}
