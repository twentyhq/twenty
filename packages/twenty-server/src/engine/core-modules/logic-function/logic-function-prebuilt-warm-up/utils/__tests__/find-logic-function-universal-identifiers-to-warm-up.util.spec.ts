import { findLogicFunctionUniversalIdentifiersToWarmUp } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/utils/find-logic-function-universal-identifiers-to-warm-up.util';
import {
  LogicFunctionExecutionMode,
  LogicFunctionRuntime,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

describe('findLogicFunctionUniversalIdentifiersToWarmUp', () => {
  it('keeps created functions and updates that change the prebuilt bundle state', () => {
    const workspaceMigration: WorkspaceMigration = {
      applicationUniversalIdentifier: 'test-app',
      actions: [
        {
          type: 'create',
          metadataName: 'logicFunction',
          flatEntity: {
            universalIdentifier: 'created',
            applicationUniversalIdentifier: 'test-app',
            name: 'created',
            sourceHandlerPath: 'src/created.ts',
            builtHandlerPath: 'dist/created.mjs',
            handlerName: 'handler',
            description: null,
            runtime: LogicFunctionRuntime.NODE22,
            timeoutSeconds: 300,
            checksum: null,
            isBuildUpToDate: false,
            executionMode: LogicFunctionExecutionMode.LIVE,
            cronTriggerSettings: null,
            databaseEventTriggerSettings: null,
            httpRouteTriggerSettings: null,
            serverRouteTriggerSettings: null,
            toolTriggerSettings: null,
            workflowActionTriggerSettings: null,
            jobConfig: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            deletedAt: null,
          },
        },
        {
          type: 'update',
          metadataName: 'logicFunction',
          universalIdentifier: 'checksum-changed',
          update: { checksum: 'new' },
        },
        {
          type: 'update',
          metadataName: 'logicFunction',
          universalIdentifier: 'became-prebuilt',
          update: { executionMode: LogicFunctionExecutionMode.PREBUILT },
        },
        {
          type: 'update',
          metadataName: 'logicFunction',
          universalIdentifier: 'description-only',
          update: { description: 'renamed' },
        },
        {
          type: 'delete',
          metadataName: 'logicFunction',
          universalIdentifier: 'deleted',
        },
        {
          type: 'delete',
          metadataName: 'objectMetadata',
          universalIdentifier: 'object',
        },
      ],
    };

    expect(
      findLogicFunctionUniversalIdentifiersToWarmUp(workspaceMigration),
    ).toEqual(['created', 'checksum-changed', 'became-prebuilt']);
  });
});
