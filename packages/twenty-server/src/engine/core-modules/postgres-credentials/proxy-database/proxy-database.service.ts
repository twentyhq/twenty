import { Injectable } from '@nestjs/common';

import { randomBytes } from 'crypto';

import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table';

@Injectable()
export class ProxyDatabaseService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly environmentService: EnvironmentService,
    private readonly typeOrmService: TypeORMService,
  ) {}

  async initializeProxyDatabase(
    user: string,
    password: string,
    workspaceId: string,
  ) {
    const schema = await this.getWorkspaceSchema(workspaceId);

    const databaseName = this.buildDatabaseName(schema);

    await this.createProxyDatabase(databaseName);

    await this.setupUserAndForeignDataWrapper(
      user,
      password,
      databaseName,
      schema,
      workspaceId,
    );
  }

  async deleteProxyDatabaseAndUser(user: string, workspaceId: string) {
    const schema = await this.getWorkspaceSchema(workspaceId);

    const databaseName = this.buildDatabaseName(schema);

    try {
      const dataSource = this.getProxyDatabaseDataSource(
        this.environmentService.get('PG_PROXY_DATABASE_NAME'),
      );

      await dataSource.initialize();

      await dataSource.query(`DROP DATABASE ${databaseName}`);

      await dataSource.query(`DROP USER ${user}`);

      await dataSource.destroy();
    } catch (error) {
      // should be a 500 error but not properly handled yet
      // throw new BadRequestException('Failed to delete proxy database');
      console.log('Failed to delete proxy database');
      throw error;
    }
  }

  private async createProxyDatabase(databaseName: string) {
    try {
      const dataSource = this.getProxyDatabaseDataSource(
        this.environmentService.get('PG_PROXY_DATABASE_NAME'),
      );

      await dataSource.initialize();

      await dataSource.query(`CREATE DATABASE ${databaseName}`);

      await dataSource.destroy();
    } catch (error) {
      // should be a 500 error but not properly handled yet
      // throw new BadRequestException('Failed to create proxy database');
      console.log('Failed to create proxy database');
      throw error;
    }
  }

  private async setupUserAndForeignDataWrapper(
    user: string,
    password: string,
    databaseName: string,
    schema: string,
    workspaceId: string,
  ) {
    try {
      const dataSource = this.getProxyDatabaseDataSource(databaseName);

      await dataSource.initialize();

      await this.createUserAndPrivileges(
        dataSource,
        user,
        password,
        databaseName,
      );

      await this.createForeignDataWrapper(dataSource, schema, workspaceId);

      await dataSource.destroy();
    } catch (error) {
      // should be a 500 error but not properly handled yet
      //   throw new BadRequestException(
      //     'Failed to grant proxy database priviledges',
      //   );
      console.log('Failed to grant proxy database priviledges');
      throw error;
    }
  }

  private async createUserAndPrivileges(
    dataSource: DataSource,
    user: string,
    password: string,
    databaseName: string,
  ) {
    await dataSource.query(`CREATE USER ${user} WITH PASSWORD '${password}'`);

    await dataSource.query(
      `GRANT CONNECT ON DATABASE ${databaseName} TO ${user}`,
    );

    await dataSource.query(`GRANT USAGE ON SCHEMA public TO ${user}`);

    await dataSource.query(
      `GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${user}`,
    );

    await dataSource.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ${user}`,
    );
  }

  private async createForeignDataWrapper(
    dataSource: DataSource,
    schema: string,
    workspaceId: string,
  ) {
    const foreignDataWrapper = `fdw_${randomBytes(4).toString('hex')}`;

    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS postgres_fdw`);

    await dataSource.query(
      `CREATE SERVER "${foreignDataWrapper}" FOREIGN DATA WRAPPER postgres_fdw OPTIONS (host 'localhost', dbname 'default', port '5432')`,
    );

    await dataSource.query(
      `CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER SERVER "${foreignDataWrapper}" OPTIONS (user 'twenty', password 'twenty')`,
    );

    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    const distantTables = await this.getDistantTables(workspaceId);

    await this.createForeignTables(
      dataSource,
      distantTables,
      schema,
      foreignDataWrapper,
    );
  }

  private buildDatabaseName(schema: string) {
    return `db_${schema}`;
  }

  private async getWorkspaceSchema(workspaceId: string) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    return dataSourceMetadata.schema;
  }

  private getProxyDatabaseDataSource(databaseName: string) {
    return new DataSource({
      type: 'postgres',
      host: this.environmentService.get('PG_PROXY_DATABASE_HOST'),
      port: this.environmentService.get('PG_PROXY_DATABASE_PORT'),
      username: this.environmentService.get('PG_PROXY_DATABASE_USER'),
      password: this.environmentService.get('PG_PROXY_DATABASE_PASSWORD'),
      database: databaseName,
    });
  }

  private async getDistantTables(workspace): Promise<DistantTables> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspace.id,
      );

    const dataSource =
      await this.typeOrmService.connectToDataSource(dataSourceMetadata);

    if (!dataSource) {
      return {};
    }

    const tables = await dataSource.query(
      `SELECT table_name, column_name, udt_name, data_type FROM information_schema.columns WHERE table_schema = '${dataSourceMetadata.schema}'`,
    );

    const distantTables = tables.reduce(
      (acc, { table_name, column_name, data_type, udt_name }) => {
        if (!acc[table_name]) {
          acc[table_name] = [];
        }

        acc[table_name].push({
          columnName: column_name,
          dataType: data_type,
          udtName: udt_name,
        });

        return acc;
      },
      {},
    );

    console.log(distantTables);

    return distantTables;
  }

  private async createForeignTables(
    dataSource: DataSource,
    distantTables: DistantTables,
    schema: string,
    foreignDataWrapper: string,
  ) {
    return Object.entries(distantTables).map(async ([tableName, columns]) => {
      await dataSource.query(
        `CREATE FOREIGN TABLE IF NOT EXISTS "${schema}"."${tableName}" (
                ${columns
                  .map(
                    ({ columnName, dataType }) =>
                      `"${columnName}" ${this.getDataType(dataType)}`,
                  )
                  .join(',\n')}
            ) SERVER ${foreignDataWrapper} OPTIONS (table_name '${tableName}', schema_name '${schema}')`,
      );
    });
  }

  private getDataType(dataType: string) {
    if (dataType.includes('workspace_')) {
      return 'text';
    }

    return dataType;
  }
}
