import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('activity operation signature factories', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  it('derives the junction object and source relation from metadata', () => {
    const result = findActivityTargetsOperationSignatureFactory({
      objectNameSingular: StandardObjectNameSingular.Task,
      objectMetadataItems,
    });

    expect(result.objectNameSingular).toBe(
      StandardObjectNameSingular.TaskTarget,
    );
    expect(result.fields).toMatchObject({
      taskId: true,
      task: {
        id: true,
        taskTargets: {
          id: true,
        },
      },
    });
  });
});
