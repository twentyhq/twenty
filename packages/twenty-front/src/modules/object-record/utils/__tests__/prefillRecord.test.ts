import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('prefillRecord', () => {
  it('preserves the resolved record for the populated morph member', () => {
    const taskTargetObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('taskTarget');

    const companyRecord = { id: 'company-id', __typename: 'Company' };

    expect(
      prefillRecord({
        objectMetadataItem: taskTargetObjectMetadataItem,
        input: {
          id: 'task-target-id',
          targetCompanyId: companyRecord.id,
          targetCompany: companyRecord,
        },
      }),
    ).toMatchObject({
      targetCompanyId: companyRecord.id,
      targetCompany: companyRecord,
    });
  });
});
