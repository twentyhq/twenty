import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyResolver } from 'src/engine/core-modules/api-key/api-key.resolver';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey], 'core'), JwtModule],
  providers: [ApiKeyService, ApiKeyResolver],
  exports: [ApiKeyService, TypeOrmModule],
})
export class ApiKeyModule {}
