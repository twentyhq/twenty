import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { ApplicationAuthorizationResolver } from 'src/engine/core-modules/application/application-authorization/application-authorization.resolver';
import { ApplicationAuthorizationService } from 'src/engine/core-modules/application/application-authorization/services/application-authorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationAuthorizationEntity])],
  providers: [
    ApplicationAuthorizationService,
    ApplicationAuthorizationResolver,
  ],
  exports: [ApplicationAuthorizationService],
})
export class ApplicationAuthorizationModule {}
