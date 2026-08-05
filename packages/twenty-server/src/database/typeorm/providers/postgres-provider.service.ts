import { Injectable, Logger } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class PostgresProviderService {
  private readonly logger = new Logger(PostgresProviderService.name);
  private dataSources: Map<string, DataSource> = new Map();

  constructor() {}

  async createDataSource(
    name: string,
    options: DataSourceOptions,
  ): Promise<DataSource> {
    if (this.dataSources.has(name)) {
      this.logger.debug(`DataSource ${name} already exists. Returning cached instance.`);
      return this.dataSources.get(name)!;
    }

    this.logger.log(`Creating new Postgres DataSource: ${name}`);
    
    // Ensure we are explicitly using postgres if not overridden
    const pgOptions = {
      ...options,
      type: 'postgres' as const,
      poolSize: (options as any).poolSize || 10,
      extra: {
        ...(options as any).extra,
        statement_timeout: 30000,
      }
    };

    const dataSource = new DataSource(pgOptions);
    await dataSource.initialize();
    
    this.dataSources.set(name, dataSource);
    return dataSource;
  }

  async closeDataSource(name: string): Promise<void> {
    const ds = this.dataSources.get(name);
    if (ds && ds.isInitialized) {
      await ds.destroy();
      this.dataSources.delete(name);
      this.logger.log(`Closed DataSource: ${name}`);
    }
  }

  async closeAll(): Promise<void> {
    const promises = Array.from(this.dataSources.keys()).map((name) =>
      this.closeDataSource(name),
    );
    await Promise.all(promises);
  }
}
