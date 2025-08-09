import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

import { ApiKeyCreateCommand } from './apikey-create.command';

import { ApiKeyNotificationService } from './services/api-key-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    ApiKeyModule,
    RoleModule,
    PermissionsModule,
    TwentyORMModule,
    EmailModule,
  ],
  providers: [ApiKeyCreateCommand, ApiKeyNotificationService],
})
export class ApiKeyCreateCommandModule {}
