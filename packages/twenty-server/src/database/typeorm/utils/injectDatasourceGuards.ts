import { DataSource } from 'typeorm';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';

export const injectDatasourceGuards = (dataSource: DataSource) => {
  const originalQuery = dataSource.query.bind(dataSource);

  dataSource.query = async (
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, ' ');

    if (
      (normalizedQuery.startsWith('update') ||
        normalizedQuery.startsWith('delete')) &&
      !normalizedQuery.includes(' where ')
    ) {
      throw new Error(
        `Blocked unsafe query. UPDATE or DELETE without WHERE clause is not allowed: ${query}`,
      );
    }

    return originalQuery(query, parameters, queryRunner);
  };
};
