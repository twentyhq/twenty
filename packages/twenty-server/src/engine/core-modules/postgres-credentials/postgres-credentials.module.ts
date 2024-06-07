import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { PostgresCredentialsResolver } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.resolver';
import { PostgresCredentialsService } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.service';
import { ProxyDatabaseModule } from 'src/engine/core-modules/postgres-credentials/proxy-database/proxy-database.module';
import { EnvironmentModule } from 'src/engine/integrations/environment/environment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostgresCredentials], 'core'),
    EnvironmentModule,
    ProxyDatabaseModule,
  ],
  providers: [
    PostgresCredentialsResolver,
    PostgresCredentialsService,
    PostgresCredentials,
  ],
})
export class PostgresCredentialsModule {}
