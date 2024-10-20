import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PostgresCredentialsResolver } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.resolver';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostgresCredentials], 'core'), JwtModule],
  providers: [
    PostgresCredentialsResolver,
    PostgresCredentialsService,
    PostgresCredentials,
  ],
})
export class PostgresCredentialsModule {}
