import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('activity operation signature factories', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  it('derives the junction object and source relation from metadata', () => {
    const result = findActivityTargetsOperationSignatureFactory({
      objectNameSingular: CoreObjectNameSingular.Task,
      objectMetadataItems,
    });

    expect(result.objectNameSingular).toBe(CoreObjectNameSingular.TaskTarget);
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
