import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { PostgresCredentialsEntity } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PostgresCredentialsResolver } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.resolver';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([PostgresCredentialsEntity])],
  providers: [
    PostgresCredentialsResolver,
    PostgresCredentialsService,
    PostgresCredentialsEntity,
  ],
})
export class PostgresCredentialsModule {}
