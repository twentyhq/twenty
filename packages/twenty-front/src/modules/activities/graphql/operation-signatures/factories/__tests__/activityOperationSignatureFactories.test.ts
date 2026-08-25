import { findActivitiesOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivitiesOperationSignatureFactory';
import { findActivityTargetsOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivityTargetsOperationSignatureFactory';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('activity operation signature factories', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  it('loads the configured junction targets with an activity', () => {
    const result = findActivitiesOperationSignatureFactory({
      objectNameSingular: CoreObjectNameSingular.Note,
      objectMetadataItems,
    });

    expect(result.fields).toMatchObject({
      noteTargets: {
        id: true,
        targetCompany: {
          id: true,
        },
        targetPerson: {
          id: true,
        },
      },
    });
  });

  it('derives the junction object and source relation from metadata', () => {
    const result = findActivityTargetsOperationSignatureFactory({
      objectNameSingular: CoreObjectNameSingular.Task,
      objectMetadataItems,
    });

    expect(result.objectNameSingular).toBe(CoreObjectNameSingular.TaskTarget);
    expect(result.fields).toMatchObject({
      task: {
        id: true,
        taskTargets: {
          id: true,
        },
      },
    });
  });
});
