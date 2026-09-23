import { findLogicFunctionUniversalIdentifiersToWarmUp } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/utils/find-logic-function-universal-identifiers-to-warm-up.util';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';

describe('findLogicFunctionUniversalIdentifiersToWarmUp', () => {
  it('keeps created functions and updates that change the prebuilt bundle state', () => {
    const workspaceMigration = {
      applicationUniversalIdentifier: 'test-app',
      actions: [
        {
          type: 'create',
          metadataName: 'logicFunction',
          flatEntity: { universalIdentifier: 'created' },
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
          update: { executionMode: 'PREBUILT' },
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
          type: 'create',
          metadataName: 'objectMetadata',
          flatEntity: { universalIdentifier: 'object' },
        },
      ],
    } as unknown as WorkspaceMigration;

    expect(
      findLogicFunctionUniversalIdentifiersToWarmUp(workspaceMigration),
    ).toEqual(['created', 'checksum-changed', 'became-prebuilt']);
  });
});
