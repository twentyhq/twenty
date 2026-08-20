import { isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission } from '@/object-record/read-only/utils/isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type RestrictedFields = Record<
  string,
  { canRead: boolean | null; canUpdate: boolean | null }
>;

const buildObjectPermissions = (opts: {
  objectMetadataId: string;
  canUpdate?: boolean;
  restrictedFields?: RestrictedFields;
}) => ({
  objectMetadataId: opts.objectMetadataId,
  canReadObjectRecords: true,
  canUpdateObjectRecords: opts.canUpdate ?? true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: opts.restrictedFields ?? {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

const buildObjectPermissionsMap = (opts: {
  sourceId: string;
  targetId: string;
  targetCanUpdate: boolean;
  targetRestrictedFields?: RestrictedFields;
}) => ({
  [opts.sourceId]: buildObjectPermissions({
    objectMetadataId: opts.sourceId,
  }),
  [opts.targetId]: buildObjectPermissions({
    objectMetadataId: opts.targetId,
    canUpdate: opts.targetCanUpdate,
    restrictedFields: opts.targetRestrictedFields,
  }),
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
      isUIEditable: true,
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

  it('should return true when the inverse relation field on the related object is update-restricted', () => {
    expect(
      isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
        fieldDefinition: oneToManyFieldDefinition,
        objectPermissionsByObjectMetadataId: buildObjectPermissionsMap({
          sourceId: sourceObjectMetadataId,
          targetId: targetObjectMetadataId,
          targetCanUpdate: true,
          targetRestrictedFields: {
            'target-field': { canRead: null, canUpdate: false },
          },
        }),
      }),
    ).toBe(true);
  });

  it('should return false when only unrelated fields on the related object are update-restricted', () => {
    expect(
      isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
        fieldDefinition: oneToManyFieldDefinition,
        objectPermissionsByObjectMetadataId: buildObjectPermissionsMap({
          sourceId: sourceObjectMetadataId,
          targetId: targetObjectMetadataId,
          targetCanUpdate: true,
          targetRestrictedFields: {
            'some-other-field': { canRead: null, canUpdate: false },
          },
        }),
      }),
    ).toBe(false);
  });

  it('should return false when the inverse relation field is read-restricted but not update-restricted', () => {
    expect(
      isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
        fieldDefinition: oneToManyFieldDefinition,
        objectPermissionsByObjectMetadataId: buildObjectPermissionsMap({
          sourceId: sourceObjectMetadataId,
          targetId: targetObjectMetadataId,
          targetCanUpdate: true,
          targetRestrictedFields: {
            'target-field': { canRead: false, canUpdate: null },
          },
        }),
      }),
    ).toBe(false);
  });

  describe('morph relations', () => {
    const firstMorphTargetObjectMetadataId = 'first-morph-target-object-id';
    const secondMorphTargetObjectMetadataId = 'second-morph-target-object-id';

    const buildMorphRelation = (targetObjectMetadataId: string) => ({
      type: RelationType.ONE_TO_MANY,
      sourceFieldMetadata: { id: 'morph-field-on-person', name: 'targets' },
      targetFieldMetadata: {
        id: `inverse-field-on-${targetObjectMetadataId}`,
        name: 'person',
      },
      sourceObjectMetadata: {
        id: sourceObjectMetadataId,
        nameSingular: 'person',
        namePlural: 'people',
      },
      targetObjectMetadata: {
        id: targetObjectMetadataId,
        nameSingular: 'target',
        namePlural: 'targets',
      },
    });

    const morphOneToManyFieldDefinition = {
      type: FieldMetadataType.MORPH_RELATION,
      fieldMetadataId: 'morph-field-on-person',
      label: 'Targets',
      iconName: 'IconRelation',
      metadata: {
        fieldName: 'targets',
        relationType: RelationType.ONE_TO_MANY,
        objectMetadataNameSingular: 'person',
        morphRelations: [
          buildMorphRelation(firstMorphTargetObjectMetadataId),
          buildMorphRelation(secondMorphTargetObjectMetadataId),
        ],
        settings: null,
        isCustom: true,
        isUIEditable: true,
      },
    } as FieldDefinition<FieldMetadata>;

    const buildMorphObjectPermissionsMap = (
      restrictedFieldsByObjectMetadataId: Record<string, RestrictedFields>,
    ) =>
      Object.fromEntries(
        [
          firstMorphTargetObjectMetadataId,
          secondMorphTargetObjectMetadataId,
        ].map((objectMetadataId) => [
          objectMetadataId,
          buildObjectPermissions({
            objectMetadataId,
            restrictedFields:
              restrictedFieldsByObjectMetadataId[objectMetadataId],
          }),
        ]),
      );

    it('should return true when every morph target has its inverse relation field update-restricted', () => {
      expect(
        isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
          fieldDefinition: morphOneToManyFieldDefinition,
          objectPermissionsByObjectMetadataId: buildMorphObjectPermissionsMap({
            [firstMorphTargetObjectMetadataId]: {
              [`inverse-field-on-${firstMorphTargetObjectMetadataId}`]: {
                canRead: null,
                canUpdate: false,
              },
            },
            [secondMorphTargetObjectMetadataId]: {
              [`inverse-field-on-${secondMorphTargetObjectMetadataId}`]: {
                canRead: null,
                canUpdate: false,
              },
            },
          }),
        }),
      ).toBe(true);
    });

    it('should return false when only one morph target has its inverse relation field update-restricted', () => {
      expect(
        isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
          fieldDefinition: morphOneToManyFieldDefinition,
          objectPermissionsByObjectMetadataId: buildMorphObjectPermissionsMap({
            [firstMorphTargetObjectMetadataId]: {
              [`inverse-field-on-${firstMorphTargetObjectMetadataId}`]: {
                canRead: null,
                canUpdate: false,
              },
            },
          }),
        }),
      ).toBe(false);
    });

    it('should return false when the morph field has no relations', () => {
      expect(
        isOneToManyRelationFieldReadOnlyDueToTargetUpdatePermission({
          fieldDefinition: {
            ...morphOneToManyFieldDefinition,
            metadata: {
              ...morphOneToManyFieldDefinition.metadata,
              morphRelations: [],
            },
          } as FieldDefinition<FieldMetadata>,
          objectPermissionsByObjectMetadataId: buildMorphObjectPermissionsMap(
            {},
          ),
        }),
      ).toBe(false);
    });
  });
});
