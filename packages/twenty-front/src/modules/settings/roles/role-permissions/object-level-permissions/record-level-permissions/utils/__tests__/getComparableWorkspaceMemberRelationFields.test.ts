import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getComparableWorkspaceMemberRelationFields } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getComparableWorkspaceMemberRelationFields';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const REGION_OBJECT_ID = '20202020-0000-4000-8000-000000000001';
const TEAM_OBJECT_ID = '20202020-0000-4000-8000-000000000002';

const buildRelationField = ({
  name,
  targetObjectMetadataId,
  relationType,
}: {
  name: string;
  targetObjectMetadataId: string;
  relationType: RelationType;
}) =>
  ({
    id: `field-${name}`,
    name,
    label: name,
    type: FieldMetadataType.RELATION,
    relation: {
      type: relationType,
      targetObjectMetadata: { id: targetObjectMetadataId },
    },
  }) as FieldMetadataItem;

const regionField = buildRelationField({
  name: 'region',
  targetObjectMetadataId: REGION_OBJECT_ID,
  relationType: RelationType.MANY_TO_ONE,
});

const teamField = buildRelationField({
  name: 'team',
  targetObjectMetadataId: TEAM_OBJECT_ID,
  relationType: RelationType.MANY_TO_ONE,
});

const regionsField = buildRelationField({
  name: 'regions',
  targetObjectMetadataId: REGION_OBJECT_ID,
  relationType: RelationType.ONE_TO_MANY,
});

const jobTitleField = {
  id: 'field-jobTitle',
  name: 'jobTitle',
  label: 'Job Title',
  type: FieldMetadataType.TEXT,
} as FieldMetadataItem;

const workspaceMemberFieldMetadataItems = [
  regionField,
  teamField,
  regionsField,
  jobTitleField,
];

describe('getComparableWorkspaceMemberRelationFields', () => {
  it('returns the many-to-one relations pointing to the target object', () => {
    const result = getComparableWorkspaceMemberRelationFields({
      workspaceMemberFieldMetadataItems,
      targetObjectMetadataId: REGION_OBJECT_ID,
    });

    expect(result).toEqual([regionField]);
  });

  it('excludes relations pointing to another object', () => {
    const result = getComparableWorkspaceMemberRelationFields({
      workspaceMemberFieldMetadataItems,
      targetObjectMetadataId: TEAM_OBJECT_ID,
    });

    expect(result).toEqual([teamField]);
  });

  it('returns nothing when the target object is unknown', () => {
    const result = getComparableWorkspaceMemberRelationFields({
      workspaceMemberFieldMetadataItems,
      targetObjectMetadataId: undefined,
    });

    expect(result).toEqual([]);
  });

  it('returns nothing when no relation matches', () => {
    const result = getComparableWorkspaceMemberRelationFields({
      workspaceMemberFieldMetadataItems: [jobTitleField, regionsField],
      targetObjectMetadataId: TEAM_OBJECT_ID,
    });

    expect(result).toEqual([]);
  });
});
