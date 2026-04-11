import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { DataSource, type Repository } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import {
  UpgradeSequenceReaderService,
  type UpgradeStep,
  type WorkspaceUpgradeStep,
} from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

export const WS_1 = SEED_APPLE_WORKSPACE_ID;
export const WS_2 = SEED_YCOMBINATOR_WORKSPACE_ID;

export const makeStep = (
  kind: UpgradeStep['kind'],
  name: string,
): UpgradeStep =>
  ({
    kind,
    name,
    command: {},
    version: '1.21.0',
    timestamp: 0,
  }) as unknown as UpgradeStep;

export const makeFastInstance = (name: string) =>
  makeStep('fast-instance', name);

export const makeSlowInstance = (name: string) =>
  makeStep('slow-instance', name);

export const makeWorkspace = (name: string) =>
  makeStep('workspace', name) as WorkspaceUpgradeStep;

export const DEFAULT_OPTIONS = {
  workspaceId: undefined,
  startFromWorkspaceId: undefined,
  workspaceCountLimit: undefined,
  dryRun: false,
  verbose: false,
};

type IntegrationTestModule = Awaited<
  ReturnType<typeof createUpgradeSequenceRunnerIntegrationTestModule>
>;

export type IntegrationTestContext = {
  [K in keyof IntegrationTestModule]: IntegrationTestModule[K];
};

export const createUpgradeSequenceRunnerIntegrationTestModule = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.PG_DATABASE_URL,
    schema: 'core',
    entities: [
      'src/engine/core-modules/**/*.entity.ts',
      'src/engine/metadata-modules/**/*.entity.ts',
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const migrationRepo: Repository<UpgradeMigrationEntity> =
    dataSource.getRepository(UpgradeMigrationEntity);

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: getRepositoryToken(UpgradeMigrationEntity),
        useValue: migrationRepo,
      },
      UpgradeMigrationService,
      {
        provide: UpgradeSequenceReaderService,
        useFactory: () => new UpgradeSequenceReaderService({} as any),
      },
      {
        provide: InstanceCommandRunnerService,
        useValue: {
          runFastInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
          runSlowInstanceCommand: jest
            .fn()
            .mockResolvedValue({ status: 'success' }),
        },
      },
      {
        provide: WorkspaceCommandRunnerService,
        useValue: {
          runWorkspaceCommands: jest.fn().mockResolvedValue(undefined),
        },
      },
      {
        provide: WorkspaceIteratorService,
        useValue: {
          iterate: jest.fn().mockImplementation(async (args: any) => {
            const { callback, workspaceIds } = args;
            const ids = workspaceIds ?? [WS_1];
            const report = { fail: [] as any[], success: [] as any[] };

            for (const [index, workspaceId] of ids.entries()) {
              try {
                await callback({
                  workspaceId,
                  index,
                  total: ids.length,
                  dataSource: {} as any,
                });
                report.success.push({ workspaceId });
              } catch (error) {
                report.fail.push({ error, workspaceId });
              }
            }

            return report;
          }),
        },
      },
      UpgradeSequenceRunnerService,
    ],
  }).compile();

  const runner = module.get(UpgradeSequenceRunnerService);

  jest.spyOn(runner['logger'], 'log').mockImplementation();
  jest.spyOn(runner['logger'], 'error').mockImplementation();
  jest.spyOn(runner['logger'], 'warn').mockImplementation();

  return {
    module,
    dataSource,
    runner,
    instanceUpgradeService: jest.mocked(
      module.get(InstanceCommandRunnerService),
    ),
    workspaceUpgradeService: jest.mocked(
      module.get(WorkspaceCommandRunnerService),
    ),
  };
};

let seedSequenceCounter = 0;

export const resetSeedSequenceCounter = () => {
  seedSequenceCounter = 0;
};

export const seedMigration = async (
  dataSource: DataSource,
  {
    name,
    status,
    workspaceId = null,
    attempt = 1,
  }: {
    name: string;
    status: 'completed' | 'failed';
    workspaceId?: string | null;
    attempt?: number;
  },
) => {
  const createdAt = new Date(
    Date.now() + seedSequenceCounter * 1000,
  ).toISOString();

  seedSequenceCounter++;

  await dataSource.query(
    `INSERT INTO core."upgradeMigration" (name, status, attempt, "executedByVersion", "workspaceId", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [name, status, attempt, '42.42.42', workspaceId, createdAt],
  );
};
