/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([User, AppToken, Workspace], 'core'),
    TypeORMModule,
    DataSourceModule,
    EmailModule,
  ],
  providers: [TokenService, JwtAuthStrategy],
  exports: [TokenService],
})
export class TokenModule {}
