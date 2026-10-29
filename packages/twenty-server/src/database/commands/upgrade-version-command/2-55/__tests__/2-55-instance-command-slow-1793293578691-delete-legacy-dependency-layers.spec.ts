import {
  DeleteLayerVersionCommand,
  Lambda,
  ListLayersCommand,
  ListLayerVersionsCommand,
} from '@aws-sdk/client-lambda';
import { type DataSource } from 'typeorm';

import { DeleteLegacyDependencyLayersSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-instance-command-slow-1793293578691-delete-legacy-dependency-layers';
import { getLambdaResourceNamespace } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-resource-namespace.util';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.mock('node:timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue(undefined),
}));

const LAMBDA_ROLE = 'arn:aws:iam::123456789012:role/twenty-lambda';
const NAMESPACE = getLambdaResourceNamespace({ lambdaRoleArn: LAMBDA_ROLE });
const OTHER_NAMESPACE = getLambdaResourceNamespace({
  lambdaRoleArn: 'arn:aws:iam::123456789012:role/other-instance',
});

const buildCommand = (logicFunctionType: LogicFunctionDriverType) => {
  const config: Record<string, string> = {
    LOGIC_FUNCTION_TYPE: logicFunctionType,
    LOGIC_FUNCTION_LAMBDA_REGION: 'eu-central-1',
    LOGIC_FUNCTION_LAMBDA_ACCESS_KEY_ID: 'access-key-id',
    LOGIC_FUNCTION_LAMBDA_SECRET_ACCESS_KEY: 'secret-access-key',
    LOGIC_FUNCTION_LAMBDA_ROLE: LAMBDA_ROLE,
  };

  return new DeleteLegacyDependencyLayersSlowInstanceCommand({
    get: (key: string) => config[key],
  } as unknown as TwentyConfigService);
};

const spyOnLambdaSend = () =>
  jest.spyOn(Lambda.prototype, 'send') as unknown as jest.SpyInstance<
    Promise<object>,
    [command: unknown]
  >;

const mockLambdaLayers = (layerVersionsByName: Record<string, number[]>) => {
  const layerNames = Object.keys(layerVersionsByName);
  const deletedLayerVersions: string[] = [];

  const send = spyOnLambdaSend().mockImplementation(async (command) => {
    if (command instanceof ListLayersCommand) {
      const start = Number(command.input.Marker ?? 0);
      const end = start + 2;

      return {
        Layers: layerNames
          .slice(start, end)
          .map((LayerName) => ({ LayerName })),
        NextMarker: end < layerNames.length ? String(end) : undefined,
      };
    }

    if (command instanceof ListLayerVersionsCommand) {
      return {
        LayerVersions: (
          layerVersionsByName[command.input.LayerName ?? ''] ?? []
        ).map((Version) => ({ Version })),
      };
    }

    if (command instanceof DeleteLayerVersionCommand) {
      deletedLayerVersions.push(
        `${command.input.LayerName}:${command.input.VersionNumber}`,
      );

      return {};
    }

    throw new Error('Unexpected Lambda command');
  });

  return { send, deletedLayerVersions };
};

describe('DeleteLegacyDependencyLayersSlowInstanceCommand', () => {
  const dataSource = {} as DataSource;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes every version of this instance's legacy dependency layers only", async () => {
    const { deletedLayerVersions } = mockLambdaLayers({
      [`deps-${NAMESPACE}-yarn-lock-checksum`]: [1, 2],
      [`deps-${NAMESPACE}-default`]: [1],
      [`depsv1-${NAMESPACE}-application-yarn-lock-checksum`]: [1],
      [`deps-${OTHER_NAMESPACE}-yarn-lock-checksum`]: [1],
      'sdk-workspace-application': [1],
    });

    await buildCommand(LogicFunctionDriverType.LAMBDA).runDataMigration(
      dataSource,
    );

    expect(deletedLayerVersions).toEqual([
      `deps-${NAMESPACE}-yarn-lock-checksum:1`,
      `deps-${NAMESPACE}-yarn-lock-checksum:2`,
      `deps-${NAMESPACE}-default:1`,
    ]);
  });

  it('does not call Lambda when logic functions run locally', async () => {
    const { send } = mockLambdaLayers({
      [`deps-${NAMESPACE}-default`]: [1],
    });

    await buildCommand(LogicFunctionDriverType.LOCAL).runDataMigration(
      dataSource,
    );

    expect(send).not.toHaveBeenCalled();
  });

  it('does not fail the upgrade when Lambda rejects the cleanup', async () => {
    spyOnLambdaSend().mockRejectedValue(new Error('AccessDeniedException'));

    await expect(
      buildCommand(LogicFunctionDriverType.LAMBDA).runDataMigration(dataSource),
    ).resolves.toBeUndefined();
  });
});
