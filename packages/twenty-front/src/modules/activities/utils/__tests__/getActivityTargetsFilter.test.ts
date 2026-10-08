import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';

import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getActivityTargetsFilter', () => {
  it('preserves every target when several targets have the same type', () => {
    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

    const filter = getActivityTargetsFilter({
      targetableObjects: [
        { id: 'person-1', targetObjectNameSingular: 'person' },
        { id: 'person-2', targetObjectNameSingular: 'person' },
        { id: 'company-1', targetObjectNameSingular: 'company' },
      ],
      activityTargetObjectMetadata:
        getMockObjectMetadataItemOrThrow('taskTarget'),
      objectMetadataItems,
    });

    expect(filter).toEqual({
      or: [
        { targetPersonId: { eq: 'person-1' } },
        { targetPersonId: { eq: 'person-2' } },
        { targetCompanyId: { eq: 'company-1' } },
      ],
    });
  });
});
