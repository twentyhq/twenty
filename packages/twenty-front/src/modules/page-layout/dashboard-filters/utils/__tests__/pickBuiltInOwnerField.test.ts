import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { pickBuiltInOwnerField } from '@/page-layout/dashboard-filters/utils/pickBuiltInOwnerField';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const buildRelationField = ({
  id,
  name,
  relationType = RelationType.MANY_TO_ONE,
  targetNameSingular = 'workspaceMember',
  isActive = true,
}: {
  id: string;
  name: string;
  relationType?: RelationType;
  targetNameSingular?: string;
  isActive?: boolean;
}) =>
  ({
    id,
    name,
    type: FieldMetadataType.RELATION,
    isActive,
    relation: {
      type: relationType,
      targetObjectMetadata: { nameSingular: targetNameSingular },
    },
  }) as FieldMetadataItem;

const ACCOUNT_OWNER_FIELD = buildRelationField({
  id: 'account-owner-id',
  name: 'accountOwner',
});

const ASSIGNEE_FIELD = buildRelationField({
  id: 'assignee-id',
  name: 'assignee',
});

const REVIEWER_FIELD = buildRelationField({
  id: 'reviewer-id',
  name: 'reviewer',
});

const APPROVER_FIELD = buildRelationField({
  id: 'approver-id',
  name: 'approver',
});

describe('pickBuiltInOwnerField', () => {
  it('picks nothing without a relation to workspace members', () => {
    expect(
      pickBuiltInOwnerField([
        buildRelationField({
          id: 'company-id',
          name: 'company',
          targetNameSingular: 'company',
        }),
        {
          id: 'created-at-id',
          name: 'createdAt',
          type: FieldMetadataType.DATE_TIME,
          isActive: true,
        } as FieldMetadataItem,
      ]),
    ).toBeUndefined();
  });

  it('picks the single many-to-one relation to workspace members', () => {
    expect(pickBuiltInOwnerField([ACCOUNT_OWNER_FIELD])).toBe(
      ACCOUNT_OWNER_FIELD,
    );
  });

  it('prefers a conventional owner name when several relations match', () => {
    expect(pickBuiltInOwnerField([REVIEWER_FIELD, ASSIGNEE_FIELD])).toBe(
      ASSIGNEE_FIELD,
    );
    expect(pickBuiltInOwnerField([ASSIGNEE_FIELD, ACCOUNT_OWNER_FIELD])).toBe(
      ACCOUNT_OWNER_FIELD,
    );
  });

  it('falls back to the first matching field by name regardless of input order', () => {
    expect(pickBuiltInOwnerField([REVIEWER_FIELD, APPROVER_FIELD])).toBe(
      APPROVER_FIELD,
    );
    expect(pickBuiltInOwnerField([APPROVER_FIELD, REVIEWER_FIELD])).toBe(
      APPROVER_FIELD,
    );
  });

  it('ignores inactive fields', () => {
    expect(
      pickBuiltInOwnerField([
        buildRelationField({
          id: 'inactive-id',
          name: 'accountOwner',
          isActive: false,
        }),
      ]),
    ).toBeUndefined();
  });

  it('ignores one-to-many relations to workspace members', () => {
    expect(
      pickBuiltInOwnerField([
        buildRelationField({
          id: 'members-id',
          name: 'members',
          relationType: RelationType.ONE_TO_MANY,
        }),
      ]),
    ).toBeUndefined();
  });
});
