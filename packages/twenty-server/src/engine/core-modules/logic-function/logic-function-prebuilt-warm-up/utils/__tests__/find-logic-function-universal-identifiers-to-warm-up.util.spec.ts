import { findLogicFunctionUniversalIdentifiersToWarmUp } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/utils/find-logic-function-universal-identifiers-to-warm-up.util';

describe('findLogicFunctionUniversalIdentifiersToWarmUp', () => {
  it('keeps created functions and updates that change the prebuilt bundle state', () => {
    const universalIdentifiers = findLogicFunctionUniversalIdentifiersToWarmUp({
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
          metadataName: 'objectMetadata',
        },
      ],
    });

    expect(universalIdentifiers).toEqual([
      'created',
      'checksum-changed',
      'became-prebuilt',
    ]);
  });
});
