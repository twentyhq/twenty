import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PostgresCredentialsResolver } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.resolver';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([PostgresCredentials], 'core')],
  providers: [
    PostgresCredentialsResolver,
    PostgresCredentialsService,
    PostgresCredentials,
  ],
})
export class PostgresCredentialsModule {}
