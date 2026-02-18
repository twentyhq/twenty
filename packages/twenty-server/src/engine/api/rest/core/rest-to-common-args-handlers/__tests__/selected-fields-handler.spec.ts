import { Test, type TestingModule } from '@nestjs/testing';

import {
  FieldMetadataType,
  type ObjectsPermissions,
  RelationType,
} from 'twenty-shared/types';

import { CommonSelectFieldsHelper } from 'src/engine/api/common/common-select-fields/common-select-fields-helper';
import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('RestToCommonSelectedFieldsHandler', () => {
  let handler: CommonSelectFieldsHelper;

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
      objectMetadataId: string;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId: 'workspace-id',
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      label: overrides.name,
      settings: null,
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataId: null,
      ...overrides,
    }) as FlatFieldMetadata;

  const createMockObjectMetadata = (
    overrides: Partial<FlatObjectMetadata> & {
      id: string;
      nameSingular: string;
      fieldIds: string[];
    },
  ): FlatObjectMetadata =>
    ({
      workspaceId: 'workspace-id',
      namePlural: `${overrides.nameSingular}s`,
      labelSingular: overrides.nameSingular,
      labelPlural: `${overrides.nameSingular}s`,
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      indexMetadataIds: [],
      viewIds: [],
      applicationId: null,
      labelIdentifierFieldMetadataId: null,
      imageIdentifierFieldMetadataId: null,
      ...overrides,
    }) as unknown as FlatObjectMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> =>
    fields.reduce(
      (maps, field) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: field,
          flatEntityMaps: maps,
        }),
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
    );

  const buildFlatObjectMetadataMaps = (
    objects: FlatObjectMetadata[],
  ): FlatEntityMaps<FlatObjectMetadata> =>
    objects.reduce(
      (maps, object) =>
        addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: object,
          flatEntityMaps: maps,
        }),
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
    );

  const createObjectsPermissions = (
    objectIds: string[],
    options: {
      restrictedFields?: Record<
        string,
        { canRead: boolean; canUpdate: boolean }
      >;
    } = {},
  ): ObjectsPermissions => {
    return objectIds.reduce((acc, objectId) => {
      acc[objectId] = {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: true,
        restrictedFields: options.restrictedFields || {},
        rowLevelPermissionPredicates: [],
        rowLevelPermissionPredicateGroups: [],
      };

      return acc;
    }, {} as ObjectsPermissions);
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonSelectFieldsHelper],
    }).compile();

    handler = module.get<CommonSelectFieldsHelper>(CommonSelectFieldsHelper);
  });

  describe('computeFromDepth', () => {
    it('should return all selectable fields when depth is undefined', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });
      const emailField = createMockField({
        id: 'field-2',
        name: 'email',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-1', 'field-2'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        emailField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions(['person-id']),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: undefined,
      });

      expect(result).toEqual({
        name: true,
        email: true,
      });
    });

    it('should include relation fields when depth is 1', () => {
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });
      const companyRelationField = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'person-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const companyNameField = createMockField({
        id: 'field-3',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-1', 'field-2'],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-3'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        nameField,
        companyRelationField,
        companyNameField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
        companyObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions([
          'person-id',
          'company-id',
        ]),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: 1,
      });

      expect(result).toEqual({
        name: true,
        companyId: true, // join column for MANY_TO_ONE
        company: {
          name: true,
        },
      });
    });

    it('should respect restricted fields in related objects', () => {
      const companyRelationField = createMockField({
        id: 'field-1',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'person-id',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const companyNameField = createMockField({
        id: 'field-2',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });
      const companySecretField = createMockField({
        id: 'field-3',
        name: 'secret',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-1'],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-2', 'field-3'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        companyRelationField,
        companyNameField,
        companySecretField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
        companyObject,
      ]);

      const objectsPermissions = createObjectsPermissions([
        'person-id',
        'company-id',
      ]);

      objectsPermissions['company-id'].restrictedFields = {
        'field-3': { canRead: false, canUpdate: false },
      };

      const result = handler.computeFromDepth({
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: 1,
      });

      expect(result).toEqual({
        company: {
          name: true,
          // secret field is excluded due to restrictions
        },
      });
    });

    it('should not include relation if all fields are restricted', () => {
      const companyRelationField = createMockField({
        id: 'field-1',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'person-id',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const companyNameField = createMockField({
        id: 'field-2',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-1'],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-2'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        companyRelationField,
        companyNameField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
        companyObject,
      ]);

      const objectsPermissions = createObjectsPermissions([
        'person-id',
        'company-id',
      ]);

      objectsPermissions['company-id'].restrictedFields = {
        'field-2': { canRead: false, canUpdate: false },
      };

      const result = handler.computeFromDepth({
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: 1,
      });

      // ONE_TO_MANY relations are included as regular boolean fields
      expect(result).toEqual({
        company: true,
      });
    });

    it('should handle nested relations up to MAX_DEPTH', () => {
      const personCompanyRelation = createMockField({
        id: 'field-1',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'person-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const companyNameField = createMockField({
        id: 'field-2',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });
      const companyPeopleRelation = createMockField({
        id: 'field-3',
        name: 'people',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'company-id',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
        relationTargetObjectMetadataId: 'person-id',
      });
      const personNameField = createMockField({
        id: 'field-4',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-1', 'field-4'],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-2', 'field-3'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        personCompanyRelation,
        companyNameField,
        companyPeopleRelation,
        personNameField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
        companyObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions([
          'person-id',
          'company-id',
        ]),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: MAX_DEPTH,
      });

      expect(result).toEqual({
        name: true,
        company: {
          name: true,
          people: {
            name: true,
            company: true, // Nested relation at depth 2 shows as boolean
          },
        },
      });
    });

    it('should only return label identifier fields when flag is true', () => {
      const idField = createMockField({
        id: 'field-id',
        name: 'id',
        type: FieldMetadataType.UUID,
        objectMetadataId: 'person-id',
      });
      const nameField = createMockField({
        id: 'field-1',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });
      const emailField = createMockField({
        id: 'field-2',
        name: 'email',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });

      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-id', 'field-1', 'field-2'],
        labelIdentifierFieldMetadataId: 'field-1',
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        idField,
        nameField,
        emailField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        personObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions(['person-id']),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: personObject,
        depth: undefined,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

      // onlyUseLabelIdentifierFields only applies to nested relations, not base fields
      expect(result).toEqual({
        id: true,
        name: true,
        email: true,
      });
    });

    it('should handle activity target objects (noteTarget)', () => {
      const noteRelationField = createMockField({
        id: 'field-1',
        name: 'note',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'noteTarget-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
        relationTargetObjectMetadataId: 'note-id',
      });
      const targetRelationField = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'noteTarget-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const noteNameField = createMockField({
        id: 'field-3',
        name: 'title',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'note-id',
      });
      const companyNameField = createMockField({
        id: 'field-4',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });

      const noteTargetObject = createMockObjectMetadata({
        id: 'noteTarget-id',
        nameSingular: 'noteTarget',
        fieldIds: ['field-1', 'field-2'],
      });
      const noteObject = createMockObjectMetadata({
        id: 'note-id',
        nameSingular: 'note',
        fieldIds: ['field-3'],
      });
      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-4'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        noteRelationField,
        targetRelationField,
        noteNameField,
        companyNameField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        noteTargetObject,
        noteObject,
        companyObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions([
          'noteTarget-id',
          'note-id',
          'company-id',
        ]),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: noteTargetObject,
        depth: 1,
      });

      // For noteTarget, only note and task relations are included
      // but company is a MANY_TO_ONE so it's included as a boolean
      expect(result).toEqual({
        note: {
          title: true,
        },
        company: {
          name: true,
        },
      });
    });

    it('should handle junction table relations with depth', () => {
      const junctionRelation1 = createMockField({
        id: 'field-1',
        name: 'person',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'junction-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'personId',
        },
        relationTargetObjectMetadataId: 'person-id',
      });
      const junctionRelation2 = createMockField({
        id: 'field-2',
        name: 'company',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'junction-id',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
        relationTargetObjectMetadataId: 'company-id',
      });
      const companyJunctionRelation = createMockField({
        id: 'field-3',
        name: 'personCompanies',
        type: FieldMetadataType.RELATION,
        objectMetadataId: 'company-id',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: 'field-2',
        },
        relationTargetObjectMetadataId: 'junction-id',
      });
      const companyNameField = createMockField({
        id: 'field-4',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'company-id',
      });
      const personNameField = createMockField({
        id: 'field-5',
        name: 'name',
        type: FieldMetadataType.TEXT,
        objectMetadataId: 'person-id',
      });

      const companyObject = createMockObjectMetadata({
        id: 'company-id',
        nameSingular: 'company',
        fieldIds: ['field-3', 'field-4'],
      });
      const junctionObject = createMockObjectMetadata({
        id: 'junction-id',
        nameSingular: 'personCompany',
        fieldIds: ['field-1', 'field-2'],
      });
      const personObject = createMockObjectMetadata({
        id: 'person-id',
        nameSingular: 'person',
        fieldIds: ['field-5'],
      });

      const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
        junctionRelation1,
        junctionRelation2,
        companyJunctionRelation,
        companyNameField,
        personNameField,
      ]);
      const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
        companyObject,
        junctionObject,
        personObject,
      ]);

      const result = handler.computeFromDepth({
        objectsPermissions: createObjectsPermissions([
          'company-id',
          'junction-id',
          'person-id',
        ]),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatObjectMetadata: companyObject,
        depth: MAX_DEPTH,
      });

      expect(result).toEqual({
        name: true,
        personCompanies: {
          personId: true,
          companyId: true,
          person: {
            name: true,
          },
          company: {
            name: true,
            personCompanies: true, // Circular reference shows as boolean
          },
        },
      });
    });
  });
});
