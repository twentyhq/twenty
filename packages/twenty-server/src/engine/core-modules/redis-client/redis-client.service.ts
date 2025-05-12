import { Injectable, OnModuleDestroy } from '@nestjs/common';

import IORedis, { Cluster } from 'ioredis';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  private redisClient: IORedis | Cluster | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  getClient() {
    if (!this.redisClient) {
      const clusterMode = this.twentyConfigService.get('REDIS_CLUSTER_MODE');
      const redisPassword = this.twentyConfigService.get('REDIS_PASSWORD');
      if (clusterMode === 'true' || clusterMode === true) {
        // Expect comma-separated list of host:port
        const nodesString = this.twentyConfigService.get('REDIS_CLUSTER_NODES');
        if (!nodesString) {
          throw new Error('REDIS_CLUSTER_NODES must be defined when REDIS_CLUSTER_MODE is enabled');
        }
        const nodes = nodesString.split(',').map((node) => {
          const [host, port] = node.trim().split(':');
          return { host, port: Number(port) };
        });
        this.redisClient = new Cluster(nodes, {
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            maxRetriesPerRequest: null,
            password: redisPassword,
            tls: {},
          },
        });
      } else {
        const redisUrl = this.twentyConfigService.get('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL must be defined');
        }
        // Redis URL can be in the format redis://:password@host:port or redis://host:port (Expecting password in the URL)
        this.redisClient = new IORedis(redisUrl, {
          maxRetriesPerRequest: null,
        });
      }
    }
    return this.redisClient;
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
  }
}
