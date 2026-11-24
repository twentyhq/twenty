import { getAttachmentTargetJoinColumnName } from '@/activities/files/utils/getAttachmentTargetJoinColumnName';
import { isDefined } from 'twenty-shared/utils';

import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getAttachmentTargetJoinColumnName', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const attachmentObjectMetadataItem =
    getMockObjectMetadataItemOrThrow('attachment');

  it('resolves the join column of a standard attachment target', () => {
    expect(
      getAttachmentTargetJoinColumnName({
        attachmentObjectMetadataItem,
        targetObjectNameSingular: 'person',
        objectMetadataItems,
      }),
    ).toBe('targetPersonId');
  });

  it('resolves the join column of a custom attachment target', () => {
    expect(
      getAttachmentTargetJoinColumnName({
        attachmentObjectMetadataItem,
        targetObjectNameSingular: 'rocket',
        objectMetadataItems,
      }),
    ).toBe('targetRocketId');
  });

  it('returns undefined for an object attachments cannot target', () => {
    expect(
      getAttachmentTargetJoinColumnName({
        attachmentObjectMetadataItem,
        targetObjectNameSingular: 'calendarEvent',
        objectMetadataItems,
      }),
    ).toBeUndefined();
  });

  it('ignores plain relations from attachment to the object', () => {
    const workspaceMemberRelationField = getMockObjectMetadataItemOrThrow(
      'company',
    ).fields.find((field) => field.name === 'accountOwner');

    if (!isDefined(workspaceMemberRelationField)) {
      throw new Error('company.accountOwner not found in mock metadata');
    }

    expect(
      getAttachmentTargetJoinColumnName({
        attachmentObjectMetadataItem: {
          ...attachmentObjectMetadataItem,
          fields: [
            { ...workspaceMemberRelationField, name: 'author' },
            ...attachmentObjectMetadataItem.fields,
          ],
        },
        targetObjectNameSingular: 'workspaceMember',
        objectMetadataItems,
      }),
    ).toBeUndefined();
  });
});
