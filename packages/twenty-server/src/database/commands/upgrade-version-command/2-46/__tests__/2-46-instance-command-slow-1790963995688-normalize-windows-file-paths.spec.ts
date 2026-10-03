import { Logger } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { NormalizeWindowsFilePathsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-instance-command-slow-1790963995688-normalize-windows-file-paths';

const buildDataSource = ({
  remainingBackslashRowCount,
}: {
  remainingBackslashRowCount: number;
}): {
  dataSource: DataSource;
  queries: { sql: string; params?: unknown[] }[];
} => {
  const queries: { sql: string; params?: unknown[] }[] = [];
  const dataSource = new DataSource({ type: 'postgres' });

  jest
    .spyOn(dataSource, 'query')
    .mockImplementation(async (sql: string, params?: unknown[]) => {
      queries.push({ sql, params });

      return sql.includes('count(*)')
        ? [{ count: remainingBackslashRowCount }]
        : [];
    });

  return { dataSource, queries };
};

describe('NormalizeWindowsFilePathsSlowInstanceCommand', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('only rewrites rows whose path contains a backslash', async () => {
    const { dataSource, queries } = buildDataSource({
      remainingBackslashRowCount: 0,
    });

    await new NormalizeWindowsFilePathsSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const update = queries.find(({ sql }) => sql.includes('UPDATE'));

    expect(update?.params).toEqual(['\\']);
    expect(update?.sql).toContain('WHERE strpos(path, $1) > 0');
    expect(update?.sql).toContain("replace(path, $1, '/')");
  });

  // Either collision would violate a file path unique constraint and abort the
  // whole upgrade instead of leaving one row behind.
  it('skips rows whose normalized path is taken or duplicated', async () => {
    const { dataSource, queries } = buildDataSource({
      remainingBackslashRowCount: 0,
    });

    await new NormalizeWindowsFilePathsSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const update = queries.find(({ sql }) => sql.includes('UPDATE'));

    expect(update?.sql).toContain('"legacyFile"."rank" = 1');
    expect(update?.sql).toContain('NOT EXISTS');
  });

  it('warns when rows keep their backslash path', async () => {
    const { dataSource } = buildDataSource({ remainingBackslashRowCount: 2 });

    await new NormalizeWindowsFilePathsSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('2 file row(s) kept their backslash path'),
    );
  });

  it('stays quiet when every row was normalized', async () => {
    const { dataSource } = buildDataSource({ remainingBackslashRowCount: 0 });

    await new NormalizeWindowsFilePathsSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
