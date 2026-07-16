import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationTableFilter } from '@/page-layout/widgets/field/utils/getRelationTableFilter';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-1111-2222-3333-444444444444';

const buildInverseRelationField = (
  overrides: Partial<
    Pick<FieldMetadataItem, 'name' | 'type' | 'settings'>
  > = {},
): Pick<FieldMetadataItem, 'name' | 'type' | 'settings'> => ({
  name: 'meeting',
  type: FieldMetadataType.RELATION,
  ...overrides,
});

describe('getRelationTableFilter', () => {
  it('scopes a one-to-many relation table to its host record', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        inverseRelationFieldMetadataItem: buildInverseRelationField(),
        recordObjectMetadataNameSingular: 'teamSyncMeeting',
        recordObjectMetadataNamePlural: 'teamSyncMeetings',
      }),
    ).toEqual({ meetingId: { in: [RECORD_ID] } });
  });
});
