import { Logger } from '@nestjs/common';

import {
  DeleteFunctionCommand,
  DeleteLayerVersionCommand,
  Lambda,
  ListFunctionsCommand,
  ListLayersCommand,
  ListLayerVersionsCommand,
} from '@aws-sdk/client-lambda';
import { type DataSource } from 'typeorm';

import { DeleteOrphanedLambdaResourcesCommand } from 'src/database/commands/delete-orphaned-lambda-resources.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

jest.mock('node:timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue(undefined),
}));

const LAMBDA_ROLE = 'arn:aws:iam::123456789012:role/twenty-lambda';
const WORKSPACE_ID = 'b2c4e6a8-1d3f-4a5b-8c7d-9e0f1a2b3c4d';
const DELETED_WORKSPACE_ID = 'c3d5f7b9-2e4a-4b6c-9d8e-0f1a2b3c4d5e';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'd4e6a8c0-3f5b-4c7d-8e9f-1a2b3c4d5e6f';
const LOGIC_FUNCTION_ID = 'e5f7b9d1-4a6c-4d8e-9f0a-2b3c4d5e6f7a';
const DELETED_LOGIC_FUNCTION_ID = 'f6a8c0e2-5b7d-4e9f-8a1b-3c4d5e6f7a8b';
const OTHER_INSTANCE_FUNCTION_ID = 'a7b9d1f3-6c8e-4f0a-9b2c-4d5e6f7a8b9c';

const LAMBDA_FUNCTIONS = [
  { FunctionName: LOGIC_FUNCTION_ID, Role: LAMBDA_ROLE },
  { FunctionName: DELETED_LOGIC_FUNCTION_ID, Role: LAMBDA_ROLE },
  {
    FunctionName: OTHER_INSTANCE_FUNCTION_ID,
    Role: 'arn:aws:iam::123456789012:role/other-instance',
  },
  { FunctionName: 'twenty-yarn-install-checksum', Role: LAMBDA_ROLE },
];

const LAMBDA_LAYER_NAMES = [
  `sdk-${WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
  `sdk-${DELETED_WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}`,
  `depsv1-namespace-${APPLICATION_UNIVERSAL_IDENTIFIER}-checksum`,
];

const paginate = <TItem>(items: TItem[], marker: string | undefined) => {
  const start = Number(marker ?? 0);
  const end = start + 2;

  return {
    page: items.slice(start, end),
    NextMarker: end < items.length ? String(end) : undefined,
  };
};

const spyOnLambdaSend = () =>
  jest.spyOn(Lambda.prototype, 'send') as unknown as jest.SpyInstance<
    Promise<object>,
    [command: unknown]
  >;

const mockLambda = () => {
  const deletedFunctionNames: string[] = [];
  const deletedLayerVersions: string[] = [];

  const send = spyOnLambdaSend().mockImplementation(async (command) => {
    if (command instanceof ListFunctionsCommand) {
      const { page, NextMarker } = paginate(
        LAMBDA_FUNCTIONS,
        command.input.Marker,
      );

      return { Functions: page, NextMarker };
    }

    if (command instanceof ListLayersCommand) {
      const { page, NextMarker } = paginate(
        LAMBDA_LAYER_NAMES,
        command.input.Marker,
      );

      return {
        Layers: page.map((LayerName) => ({ LayerName })),
        NextMarker,
      };
    }

    if (command instanceof ListLayerVersionsCommand) {
      return { LayerVersions: [{ Version: 1 }, { Version: 2 }] };
    }

    if (command instanceof DeleteFunctionCommand) {
      deletedFunctionNames.push(command.input.FunctionName ?? '');

      return {};
    }

    if (command instanceof DeleteLayerVersionCommand) {
      deletedLayerVersions.push(
        `${command.input.LayerName}:${command.input.VersionNumber}`,
      );

      return {};
    }

    throw new Error('Unexpected Lambda command');
  });

  return { send, deletedFunctionNames, deletedLayerVersions };
};

const buildCommand = (logicFunctionType: LogicFunctionDriverType) => {
  const config: Record<string, string> = {
    LOGIC_FUNCTION_TYPE: logicFunctionType,
    LOGIC_FUNCTION_LAMBDA_REGION: 'eu-central-1',
    LOGIC_FUNCTION_LAMBDA_ACCESS_KEY_ID: 'access-key-id',
    LOGIC_FUNCTION_LAMBDA_SECRET_ACCESS_KEY: 'secret-access-key',
    LOGIC_FUNCTION_LAMBDA_ROLE: LAMBDA_ROLE,
  };

  const rowsByEntity = new Map<unknown, object[]>([
    [LogicFunctionEntity, [{ id: LOGIC_FUNCTION_ID }]],
    [
      ApplicationEntity,
      [
        {
          workspaceId: WORKSPACE_ID,
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      ],
    ],
  ]);

  return new DeleteOrphanedLambdaResourcesCommand(
    {
      getRepository: (entity: unknown) => ({
        find: async () => rowsByEntity.get(entity) ?? [],
      }),
    } as unknown as DataSource,
    { get: (key: string) => config[key] } as unknown as TwentyConfigService,
    {} as CacheStorageService,
  );
};

describe('DeleteOrphanedLambdaResourcesCommand', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes the functions and SDK layers whose row no longer exists', async () => {
    const { deletedFunctionNames, deletedLayerVersions } = mockLambda();

    await buildCommand(LogicFunctionDriverType.LAMBDA).run([], {});

    expect(deletedFunctionNames).toEqual([DELETED_LOGIC_FUNCTION_ID]);
    expect(deletedLayerVersions).toEqual([
      `sdk-${DELETED_WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}:1`,
      `sdk-${DELETED_WORKSPACE_ID}-${APPLICATION_UNIVERSAL_IDENTIFIER}:2`,
    ]);
  });

  it('deletes nothing on dry run', async () => {
    const { deletedFunctionNames, deletedLayerVersions } = mockLambda();

    await buildCommand(LogicFunctionDriverType.LAMBDA).run([], {
      dryRun: true,
    });

    expect(deletedFunctionNames).toEqual([]);
    expect(deletedLayerVersions).toEqual([]);
  });

  it('does not call Lambda when logic functions run locally', async () => {
    const { send } = mockLambda();

    await buildCommand(LogicFunctionDriverType.LOCAL).run([], {});

    expect(send).not.toHaveBeenCalled();
  });
});
