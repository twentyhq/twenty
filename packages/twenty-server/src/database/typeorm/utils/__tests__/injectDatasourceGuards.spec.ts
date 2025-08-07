import { DataSource } from 'typeorm';

import { injectDatasourceGuards } from 'src/database/typeorm/utils/injectDatasourceGuards';

describe('injectDatasourceGuards', () => {
  let datasource: DataSource;

  beforeEach(() => {
    datasource = {} as DataSource;

    (datasource as any).query = jest.fn();

    injectDatasourceGuards(datasource);
  });

  it('should block UPDATE queries without a WHERE clause', async () => {
    const query = 'UPDATE table SET column = 1';

    await expect(() => datasource.query(query)).rejects.toThrow(
      'Blocked unsafe query',
    );
  });

  it('should not block UPDATE queries with a WHERE clause', async () => {
    const query = 'UPDATE table SET column = 1 WHERE id = "1"';

    await expect(datasource.query(query)).resolves.not.toThrow();
  });

  it('should block DELETE queries without a WHERE clause', async () => {
    const query = 'DELETE table SET column = 1';

    await expect(() => datasource.query(query)).rejects.toThrow(
      'Blocked unsafe query',
    );
  });

  it('should not block DELETE queries with a WHERE clause', async () => {
    const query = 'DELETE table SET column = 1 WHERE id = "1"';

    await expect(datasource.query(query)).resolves.not.toThrow();
  });
});
