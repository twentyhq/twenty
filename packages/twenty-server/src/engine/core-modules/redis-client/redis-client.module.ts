import { Global, Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Global()
@Module({
  imports: [EnvironmentModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
