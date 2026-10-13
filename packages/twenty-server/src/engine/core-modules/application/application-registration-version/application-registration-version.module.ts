import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVersionArtifactService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version-artifact.service';
import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionResolver } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.resolver';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationVersionArtifactController } from 'src/engine/core-modules/application/application-registration-version/controllers/application-registration-version-artifact.controller';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationVersionEntity,
      FileEntity,
    ]),
    FileUrlModule,
    JwtModule,
    SecureHttpClientModule,
  ],
  controllers: [ApplicationRegistrationVersionArtifactController],
  providers: [
    ApplicationRegistrationVersionService,
    ApplicationRegistrationVersionArtifactService,
    ApplicationRegistrationVersionResolver,
  ],
  exports: [ApplicationRegistrationVersionService],
})
export class ApplicationRegistrationVersionModule {}
