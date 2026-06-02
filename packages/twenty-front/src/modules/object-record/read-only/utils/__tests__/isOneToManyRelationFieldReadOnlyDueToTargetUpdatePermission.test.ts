import { isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission } from '@/object-record/read-only/utils/isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const buildObjectPermissionsMap = (opts: {
  sourceId: string;
  targetId: string;
  targetCanUpdate: boolean;
}) => ({
  [opts.sourceId]: {
    objectMetadataId: opts.sourceId,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  [opts.targetId]: {
    objectMetadataId: opts.targetId,
    canReadObjectRecords: true,
    canUpdateObjectRecords: opts.targetCanUpdate,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
});

describe('isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission', () => {
  const sourceObjectMetadataId = 'source-object-id';
  const targetObjectMetadataId = 'workspace-member-object-id';

  const oneToManyFieldDefinition = {
    type: FieldMetadataType.RELATION,
    fieldMetadataId: 'field-on-person',
    label: 'yehe',
    iconName: 'IconRelation',
    metadata: {
      fieldName: 'yehe',
      relationType: RelationType.ONE_TO_MANY,
      relationObjectMetadataId: targetObjectMetadataId,
      relationObjectMetadataNameSingular: 'workspaceMember',
      relationObjectMetadataNamePlural: 'workspaceMembers',
      relationFieldMetadataId: 'target-field',
      objectMetadataNameSingular: 'person',
      targetFieldMetadataName: 'person',
      settings: null,
      isCustom: true,
      isUIReadOnly: false,
    },
  } as FieldDefinition<FieldMetadata>;

  it('should return true when the related object cannot be updated', () => {
    expect(
      isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
        fieldDefinition: oneToManyFieldDefinition,
        objectPermissionsByObjectMetadataId: buildObjectPermissionsMap({
          sourceId: sourceObjectMetadataId,
          targetId: targetObjectMetadataId,
          targetCanUpdate: false,
        }),
      }),
    ).toBe(true);
  });

  it('should return false when the related object can be updated', () => {
    expect(
      isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
        fieldDefinition: oneToManyFieldDefinition,
        objectPermissionsByObjectMetadataId: buildObjectPermissionsMap({
          sourceId: sourceObjectMetadataId,
          targetId: targetObjectMetadataId,
          targetCanUpdate: true,
        }),
      }),
    ).toBe(false);
  });
});
