import { Global, Module } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

@Global()
@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
