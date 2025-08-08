import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';

import { type ClickHouseClient, createClient } from '@clickhouse/client';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private mainClient: ClickHouseClient | undefined;
  private clients: Map<string, ClickHouseClient> = new Map();
  private isClientInitializing: Map<string, boolean> = new Map();
  private readonly logger = new Logger(ClickHouseService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    if (this.twentyConfigService.get('CLICKHOUSE_URL')) {
      this.mainClient = createClient({
        url: this.twentyConfigService.get('CLICKHOUSE_URL'),
        compression: {
          response: true,
          request: true,
        },
        clickhouse_settings: {
          async_insert: 1,
          wait_for_async_insert: 1,
        },
        application: 'twenty',
      });
    }
  }

  public getMainClient(): ClickHouseClient | undefined {
    return this.mainClient;
  }

  public async connectToClient(
    clientId: string,
    url?: string,
  ): Promise<ClickHouseClient | undefined> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return undefined;
    }

    // Wait for a bit before trying again if another initialization is in progress
    while (this.isClientInitializing.get(clientId)) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (this.clients.has(clientId)) {
      return this.clients.get(clientId);
    }

    this.isClientInitializing.set(clientId, true);

    try {
      const clientInstance = await this.createAndInitializeClient(url);

      this.clients.set(clientId, clientInstance);

      return clientInstance;
    } catch (err) {
      this.logger.error(
        `Error connecting to ClickHouse client ${clientId}`,
        err,
      );

      return undefined;
    } finally {
      this.isClientInitializing.delete(clientId);
    }
  }

  private async createAndInitializeClient(
    url?: string,
  ): Promise<ClickHouseClient> {
    const client = createClient({
      url: url ?? this.twentyConfigService.get('CLICKHOUSE_URL'),
      compression: {
        response: true,
        request: true,
      },
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 1,
      },
      application: 'twenty',
    });

    // Ping to check connection
    await client.ping();

    return client;
  }

  public async disconnectFromClient(clientId: string) {
    if (!this.clients.has(clientId)) {
      return;
    }

    const client = this.clients.get(clientId);

    if (client) {
      await client.close();
    }

    this.clients.delete(clientId);
  }

  async onModuleInit() {
    if (this.mainClient) {
      // Just ping to verify the connection
      try {
        await this.mainClient.ping();
      } catch (err) {
        this.logger.error('Error connecting to ClickHouse', err);
      }
    }
  }

  async onModuleDestroy() {
    // Close main client
    if (this.mainClient) {
      await this.mainClient.close();
    }

    // Close all other clients
    for (const [, client] of this.clients) {
      await client.close();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async insert<T extends Record<string, any>>(
    table: string,
    values: T[],
    clientId?: string,
  ): Promise<{ success: boolean }> {
    try {
      const client = clientId
        ? await this.connectToClient(clientId)
        : this.mainClient;

      if (!client) {
        return { success: false };
      }

      await this.insertInChunks(client, table, values, {
        chunkSize: 1000,
        maxMemoryMB: 4,
      });

      return { success: true };
    } catch (err) {
      this.logger.error('Error inserting data into ClickHouse', err);

      return { success: false };
    }
  }

  // Method to execute a select query
  public async select<T>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any>,
    clientId?: string,
  ): Promise<T[]> {
    try {
      const client = clientId
        ? await this.connectToClient(clientId)
        : this.mainClient;

      if (!client) {
        return [];
      }

      const resultSet = await client.query({
        query,
        format: 'JSONEachRow',
        query_params: params,
      });

      const result = await resultSet.json<T>();

      return Array.isArray(result) ? result : [];
    } catch (err) {
      this.logger.error('Error executing select query in ClickHouse', err);

      return [];
    }
  }

  public async createDatabase(databaseName: string): Promise<boolean> {
    try {
      if (!this.mainClient) {
        return false;
      }

      await this.mainClient.exec({
        query: `CREATE DATABASE IF NOT EXISTS ${databaseName}`,
      });

      return true;
    } catch (err) {
      this.logger.error('Error creating database in ClickHouse', err);

      return false;
    }
  }

  public async dropDatabase(databaseName: string): Promise<boolean> {
    try {
      if (!this.mainClient) {
        return false;
      }

      await this.mainClient.exec({
        query: `DROP DATABASE IF EXISTS ${databaseName}`,
      });

      return true;
    } catch (err) {
      this.logger.error('Error dropping database in ClickHouse', err);

      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async insertInChunks<T extends Record<string, any>>(
    client: ClickHouseClient,
    table: string,
    values: T[],
    options: { chunkSize?: number; maxMemoryMB?: number } = {},
  ): Promise<void> {
    const chunkSize = options.chunkSize ?? 1000;
    const maxMemoryMB = options.maxMemoryMB;

    let chunk: T[] = [];
    let currentSizeBytes = 0;

    const flush = async () => {
      if (chunk.length === 0) return;
      await client.insert({
        table,
        values: chunk,
        format: 'JSONEachRow',
      });
      chunk = [];
      currentSizeBytes = 0;
    };

    for (const row of values) {
      const rowSize = Buffer.byteLength(JSON.stringify(row));

      chunk.push(row);
      currentSizeBytes += rowSize;

      const currentSizeMB = currentSizeBytes / 1024 / 1024;

      if (
        chunk.length >= chunkSize ||
        (maxMemoryMB !== undefined && currentSizeMB >= maxMemoryMB)
      ) {
        await flush();
      }
    }

    await flush();
  }
}
