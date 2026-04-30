import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { InstanceCommandGenerationService } from 'src/database/commands/instance-command-generation.service';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { TWENTY_PREVIOUS_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-previous-versions.constant';

const VERSION_A = TWENTY_CURRENT_VERSION;
const VERSION_B = TWENTY_PREVIOUS_VERSIONS[0];

const FIXED_TIMESTAMP = 1775000000000;

const buildMockDataSource = (
  upQueries: { query: string; parameters?: unknown[] }[],
  downQueries: { query: string; parameters?: unknown[] }[],
) => ({
  driver: {
    createSchemaBuilder: () => ({
      log: jest.fn().mockResolvedValue({ upQueries, downQueries }),
    }),
  },
});

describe('InstanceCommandGenerationService', () => {
  const buildService = async (
    upQueries: { query: string; parameters?: unknown[] }[] = [],
    downQueries: { query: string; parameters?: unknown[] }[] = [],
  ) => {
    const module = await Test.createTestingModule({
      providers: [
        InstanceCommandGenerationService,
        {
          provide: getDataSourceToken(),
          useValue: buildMockDataSource(upQueries, downQueries),
        },
      ],
    }).compile();

    return module.get(InstanceCommandGenerationService);
  };

  it('should return null when no schema changes are detected', async () => {
    const service = await buildService();

    const result = await service.generateInstanceCommand({
      migrationName: 'no-changes',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toBeNull();
  });

  it('should generate a migration with a single up/down query', async () => {
    const service = await buildService(
      [{ query: 'ALTER TABLE "core"."user" ADD "foo" varchar' }],
      [{ query: 'ALTER TABLE "core"."user" DROP COLUMN "foo"' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'add-foo-column',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate a migration with multiple queries', async () => {
    const service = await buildService(
      [
        {
          query:
            'CREATE TABLE "core"."task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" varchar NOT NULL)',
        },
        {
          query:
            'ALTER TABLE "core"."task" ADD CONSTRAINT "PK_task" PRIMARY KEY ("id")',
        },
      ],
      [
        { query: 'ALTER TABLE "core"."task" DROP CONSTRAINT "PK_task"' },
        { query: 'DROP TABLE "core"."task"' },
      ],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'create-task-table',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should generate a migration with query parameters', async () => {
    const service = await buildService(
      [
        {
          query:
            'INSERT INTO "core"."setting" ("key", "value") VALUES ($1, $2)',
          parameters: ['theme', 'dark'],
        },
      ],
      [
        {
          query: 'DELETE FROM "core"."setting" WHERE "key" = $1',
          parameters: ['theme'],
        },
      ],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'seed-setting',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should escape single quotes in SQL queries', async () => {
    const service = await buildService(
      [{ query: 'UPDATE "core"."config" SET "value" = \'it\'\'s done\'' }],
      [{ query: 'UPDATE "core"."config" SET "value" = \'original\'' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'update-config',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should escape backslashes in SQL queries', async () => {
    const service = await buildService(
      [
        {
          query: 'UPDATE "core"."config" SET "value" = E\'path\\\\to\\\\file\'',
        },
      ],
      [{ query: 'UPDATE "core"."config" SET "value" = NULL' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'update-path',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should use default migration name in class and file names', async () => {
    const service = await buildService(
      [{ query: 'ALTER TABLE "core"."user" ADD "bar" integer' }],
      [{ query: 'ALTER TABLE "core"."user" DROP COLUMN "bar"' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'auto-generated',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should encode version correctly in file and class names', async () => {
    const service = await buildService(
      [{ query: 'SELECT 1' }],
      [{ query: 'SELECT 1' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'test',
      version: VERSION_B,
      timestamp: FIXED_TIMESTAMP,
    });

    expect(result).toMatchSnapshot();
  });

  it('should return null for slow type when no schema changes are detected', async () => {
    const service = await buildService();

    const result = await service.generateInstanceCommand({
      migrationName: 'no-changes',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
      type: 'slow',
    });

    expect(result).toBeNull();
  });

  it('should generate a slow instance command with populated up/down', async () => {
    const service = await buildService(
      [
        {
          query: 'ALTER TABLE "core"."user" ALTER COLUMN "email" SET NOT NULL',
        },
      ],
      [
        {
          query: 'ALTER TABLE "core"."user" ALTER COLUMN "email" DROP NOT NULL',
        },
      ],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'make-column-not-nullable',
      version: VERSION_A,
      timestamp: FIXED_TIMESTAMP,
      type: 'slow',
    });

    expect(result).toMatchSnapshot();
  });

  it('should use correct file naming for slow instance commands', async () => {
    const service = await buildService(
      [{ query: 'SELECT 1' }],
      [{ query: 'SELECT 1' }],
    );

    const result = await service.generateInstanceCommand({
      migrationName: 'backfill-data',
      version: VERSION_B,
      timestamp: FIXED_TIMESTAMP,
      type: 'slow',
    });

    const versionSlug = VERSION_B.split('.').slice(0, 2).join('-');

    expect(result?.fileName).toBe(
      `${versionSlug}-instance-command-slow-${FIXED_TIMESTAMP}-backfill-data.ts`,
    );
    expect(result?.className).toBe('BackfillDataSlowInstanceCommand');
  });
});
