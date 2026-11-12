import { canReachSomeRecords } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildRelationSelectionFromDepth } from 'src/engine/api/common/common-select-fields/utils/build-relation-selection-from-depth.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { buildEffectiveSelectedFields } from 'src/engine/core-modules/record-crud/utils/build-effective-selected-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const buildFlatFieldMetadataMaps = (
  fields: Array<{ id: string; name: string; type: FieldMetadataType }>,
): FlatEntityMaps<FlatFieldMetadata> => {
  const universalIdentifierById: Partial<Record<string, string>> = {};
  const byUniversalIdentifier: Partial<Record<string, FlatFieldMetadata>> = {};

  for (const field of fields) {
    const universalIdentifier = `uid-${field.id}`;

    universalIdentifierById[field.id] = universalIdentifier;
    byUniversalIdentifier[universalIdentifier] = getFlatFieldMetadataMock({
      universalIdentifier,
      objectMetadataId: 'object-id',
      name: field.name,
      type: field.type,
    });
  }

  return {
    universalIdentifierById,
    byUniversalIdentifier,
    universalIdentifiersByApplicationId: {},
  };
};

const buildFlatObjectMetadata = (
  labelIdentifierFieldMetadataId: string | undefined,
  fieldIds: string[],
): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    universalIdentifier: 'object-universal-identifier',
    labelIdentifierFieldMetadataId,
    fieldIds,
  });

const emptyFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const FIELD_IDS = {
  name: 'field-id-name',
  email: 'field-id-email',
  searchVector: 'field-id-search-vector',
  richText: 'field-id-richText',
};

const defaultFlatFieldMetadataMaps = buildFlatFieldMetadataMaps([
  { id: FIELD_IDS.name, name: 'name', type: FieldMetadataType.TEXT },
  { id: FIELD_IDS.email, name: 'emails', type: FieldMetadataType.EMAILS },
  {
    id: FIELD_IDS.searchVector,
    name: 'searchVector',
    type: FieldMetadataType.TS_VECTOR,
  },
  {
    id: FIELD_IDS.richText,
    name: 'richText',
    type: FieldMetadataType.RICH_TEXT,
  },
]);

const defaultFlatObjectMetadata = buildFlatObjectMetadata(FIELD_IDS.name, [
  FIELD_IDS.name,
  FIELD_IDS.email,
  FIELD_IDS.searchVector,
  FIELD_IDS.richText,
]);

const defaultSelectedFields: CommonSelectedFields = {
  id: true,
  name: true,
  email: true,
  searchVector: true,
  body: { blocknote: true, markdown: true },
};

describe('buildEffectiveSelectedFields', () => {
  describe('when select is ["*"] (wildcard case)', () => {
    it('should return all selectable fields excluding searchVector', () => {
      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['*'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'person',
          flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
          selectableRelationFields: {},
          unreadableFieldMetadataIds: new Set<string>(),
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toHaveProperty('id');
      expect(effectiveSelectedFields).toHaveProperty('name');
      expect(effectiveSelectedFields).toHaveProperty('email');
      expect(effectiveSelectedFields).not.toHaveProperty('searchVector');
    });
  });

  describe('when select lists specific fields', () => {
    it('should return only the requested fields plus id', () => {
      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['name'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'person',
          flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
          selectableRelationFields: {},
          unreadableFieldMetadataIds: new Set<string>(),
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toHaveProperty('id');
      expect(effectiveSelectedFields).toHaveProperty('name');
      expect(effectiveSelectedFields).not.toHaveProperty('email');
      expect(effectiveSelectedFields).not.toHaveProperty('searchVector');
    });

    it('should always include id even if not listed in select', () => {
      const { effectiveSelectedFields } = buildEffectiveSelectedFields({
        select: ['email'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      expect(effectiveSelectedFields).toHaveProperty('id');
    });
  });

  describe('warning case', () => {
    it('should emit a warning with a suggestion for a near-miss field name', () => {
      const { warnings } = buildEffectiveSelectedFields({
        select: ['nam'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("Field 'nam' not found on person");
      expect(warnings[0]).toContain('name');
    });

    it('should emit a warning without a suggestion for a completely unknown field', () => {
      const { warnings } = buildEffectiveSelectedFields({
        select: ['zzz_totally_unknown'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain(
        "Field 'zzz_totally_unknown' not found on person",
      );
      expect(warnings[0]).not.toContain('Did you mean');
    });

    it('should emit one warning per unknown field', () => {
      const { warnings } = buildEffectiveSelectedFields({
        select: ['unknownA', 'unknownB'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      expect(warnings).toHaveLength(2);
    });
  });

  describe('searchVector field exclusion', () => {
    it('should exclude searchVector from wildcard results', () => {
      const { effectiveSelectedFields } = buildEffectiveSelectedFields({
        select: ['*'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      expect(effectiveSelectedFields).not.toHaveProperty('searchVector');
    });

    it('should emit a warning when searchVector is explicitly requested', () => {
      const { warnings, effectiveSelectedFields } =
        buildEffectiveSelectedFields({
          select: ['searchVector'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'person',
          flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
          selectableRelationFields: {},
          unreadableFieldMetadataIds: new Set<string>(),
        });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('searchVector');
      expect(effectiveSelectedFields).not.toHaveProperty('searchVector');
    });
  });

  describe('blocknote sub-field exclusion for RICH_TEXT fields', () => {
    it('should strip blocknote from RICH_TEXT field sub-fields', () => {
      const { effectiveSelectedFields } = buildEffectiveSelectedFields({
        select: ['*'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: {
          id: true,
          richText: { blocknote: true, markdown: true },
        },
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      const richTextFields =
        effectiveSelectedFields.richText as CommonSelectedFields;

      expect(richTextFields).not.toHaveProperty('blocknote');
      expect(richTextFields).toHaveProperty('markdown');
    });

    it('should keep blocknote when the field type is not RICH_TEXT', () => {
      const nonRichTextMaps = buildFlatFieldMetadataMaps([
        { id: FIELD_IDS.name, name: 'name', type: FieldMetadataType.TEXT },
        {
          id: FIELD_IDS.richText,
          name: 'richText',
          type: FieldMetadataType.TEXT,
        },
      ]);
      const nonRichTextObjectMetadata = buildFlatObjectMetadata(
        FIELD_IDS.name,
        [FIELD_IDS.name, FIELD_IDS.richText],
      );

      const { effectiveSelectedFields } = buildEffectiveSelectedFields({
        select: ['*'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'person',
        flatObjectMetadataMaps: emptyFlatObjectMetadataMaps,
        flatObjectMetadata: nonRichTextObjectMetadata,
        flatFieldMetadataMaps: nonRichTextMaps,
        selectedFields: {
          id: true,
          name: true,
          richText: { blocknote: true, markdown: true },
        },
        selectableRelationFields: {},
        unreadableFieldMetadataIds: new Set<string>(),
      });

      const richTextFields =
        effectiveSelectedFields.richText as CommonSelectedFields;

      expect(richTextFields).toHaveProperty('blocknote');
      expect(richTextFields).toHaveProperty('markdown');
    });
  });

  describe('relation field hydration', () => {
    const leadNameField = getFlatFieldMetadataMock({
      id: FIELD_IDS.name,
      universalIdentifier: `uid-${FIELD_IDS.name}`,
      objectMetadataId: 'investor-lead-object-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const fundField = getFlatFieldMetadataMock({
      id: 'fund-field',
      universalIdentifier: 'uid-fund-field',
      objectMetadataId: 'investor-lead-object-id',
      name: 'fund',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetObjectMetadataId: 'company-object-id',
      relationTargetFieldMetadataId: 'investor-pipeline-field',
    });
    const companyIdField = getFlatFieldMetadataMock({
      id: 'company-id-field',
      universalIdentifier: 'uid-company-id-field',
      objectMetadataId: 'company-object-id',
      name: 'id',
      type: FieldMetadataType.UUID,
    });
    const companyNameField = getFlatFieldMetadataMock({
      id: 'company-name-field',
      universalIdentifier: 'uid-company-name-field',
      objectMetadataId: 'company-object-id',
      name: 'name',
      type: FieldMetadataType.TEXT,
    });
    const investorPipelineField = getFlatFieldMetadataMock({
      id: 'investor-pipeline-field',
      universalIdentifier: 'uid-investor-pipeline-field',
      objectMetadataId: 'company-object-id',
      name: 'investorPipeline',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataId: 'investor-lead-object-id',
      relationTargetFieldMetadataId: 'fund-field',
    });

    const relationFieldMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byUniversalIdentifier: Object.fromEntries(
        [
          leadNameField,
          fundField,
          companyIdField,
          companyNameField,
          investorPipelineField,
        ].map((field) => [field.universalIdentifier, field]),
      ),
      universalIdentifierById: Object.fromEntries(
        [
          leadNameField,
          fundField,
          companyIdField,
          companyNameField,
          investorPipelineField,
        ].map((field) => [field.id, field.universalIdentifier]),
      ),
      universalIdentifiersByApplicationId: {},
    };

    const investorLeadObjectMetadata = getFlatObjectMetadataMock({
      id: 'investor-lead-object-id',
      universalIdentifier: 'uid-investor-lead-object-id',
      nameSingular: 'investorLead',
      labelIdentifierFieldMetadataId: FIELD_IDS.name,
      fieldIds: [FIELD_IDS.name, 'fund-field'],
    });
    const companyObjectMetadata = getFlatObjectMetadataMock({
      id: 'company-object-id',
      universalIdentifier: 'uid-company-object-id',
      nameSingular: 'company',
      labelIdentifierFieldMetadataId: 'company-name-field',
      fieldIds: [
        'company-id-field',
        'company-name-field',
        'investor-pipeline-field',
      ],
    });

    const relationObjectMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byUniversalIdentifier: {
        [investorLeadObjectMetadata.universalIdentifier]:
          investorLeadObjectMetadata,
        [companyObjectMetadata.universalIdentifier]: companyObjectMetadata,
      },
      universalIdentifierById: {
        [investorLeadObjectMetadata.id]:
          investorLeadObjectMetadata.universalIdentifier,
        [companyObjectMetadata.id]: companyObjectMetadata.universalIdentifier,
      },
      universalIdentifiersByApplicationId: {},
    };

    const buildRecordsPermissions = ({
      canReadCompany = true,
      sourceUnreadableFields = [],
    }: {
      canReadCompany?: boolean;
      sourceUnreadableFields?: string[];
    }): Pick<RoleRecordsPermissions, 'objects'> => ({
      objects: {
        'investor-lead-object-id': {
          canCreateAllRecords: false,
          canReadAllRecords: true,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          unreadableFields: sourceUnreadableFields,
          uneditableFields: sourceUnreadableFields,
        },
        'company-object-id': {
          canCreateAllRecords: false,
          canReadAllRecords: canReadCompany,
          canUpdateAllRecords: false,
          canSoftDeleteAllRecords: false,
          canDestroyAllRecords: false,
          unreadableFields: [],
          uneditableFields: [],
        },
      },
    });

    const buildUnreadableFieldMetadataIds = (
      recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>,
    ) =>
      new Set(
        [investorLeadObjectMetadata, companyObjectMetadata].flatMap(
          (objectMetadata) =>
            objectMetadata.fieldIds.filter((fieldId) =>
              recordsPermissions.objects[
                objectMetadata.id
              ]?.unreadableFields.includes(fieldId),
            ),
        ),
      );

    const buildSelectableRelationFields = (
      recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>,
    ) =>
      buildRelationSelectionFromDepth({
        flatFields: findManyFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityIds: investorLeadObjectMetadata.fieldIds,
          flatEntityMaps: relationFieldMaps,
        }),
        flatObjectMetadataMaps: relationObjectMaps,
        flatFieldMetadataMaps: relationFieldMaps,
        unreadableFieldMetadataIds:
          buildUnreadableFieldMetadataIds(recordsPermissions),
        readableObjectMetadataIds: new Set(
          Object.entries(recordsPermissions.objects)
            .filter(([, objectRecordsPermissions]) =>
              canReachSomeRecords({
                objectRecordsPermissions,
                operationType: 'read',
              }),
            )
            .map(([objectMetadataId]) => objectMetadataId),
        ),
        depth: 1,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

    it('should hydrate a selected one-to-many relation instead of its unresolvable boolean entry', () => {
      const recordsPermissions = buildRecordsPermissions({});

      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['name', 'fund'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'investorLead',
          flatObjectMetadataMaps: relationObjectMaps,
          flatObjectMetadata: investorLeadObjectMetadata,
          flatFieldMetadataMaps: relationFieldMaps,
          selectedFields: { id: true, name: true, fund: true },
          selectableRelationFields:
            buildSelectableRelationFields(recordsPermissions),
          unreadableFieldMetadataIds:
            buildUnreadableFieldMetadataIds(recordsPermissions),
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should hydrate a selected relation that also appears in orderBy', () => {
      const recordsPermissions = buildRecordsPermissions({});

      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['name', 'fund'],
          filter: undefined,
          orderBy: [{ fund: 'AscNullsLast' }],
          objectName: 'investorLead',
          flatObjectMetadataMaps: relationObjectMaps,
          flatObjectMetadata: investorLeadObjectMetadata,
          flatFieldMetadataMaps: relationFieldMaps,
          selectedFields: { id: true, name: true, fund: true },
          selectableRelationFields:
            buildSelectableRelationFields(recordsPermissions),
          unreadableFieldMetadataIds:
            buildUnreadableFieldMetadataIds(recordsPermissions),
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should hydrate readable relations in wildcard selection', () => {
      const recordsPermissions = buildRecordsPermissions({});

      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['*'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'investorLead',
          flatObjectMetadataMaps: relationObjectMaps,
          flatObjectMetadata: investorLeadObjectMetadata,
          flatFieldMetadataMaps: relationFieldMaps,
          selectedFields: { id: true, name: true, fund: true },
          selectableRelationFields:
            buildSelectableRelationFields(recordsPermissions),
          unreadableFieldMetadataIds:
            buildUnreadableFieldMetadataIds(recordsPermissions),
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should warn when selecting a relation whose target is not readable', () => {
      const recordsPermissions = buildRecordsPermissions({
        canReadCompany: false,
      });

      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['fund'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'investorLead',
          flatObjectMetadataMaps: relationObjectMaps,
          flatObjectMetadata: investorLeadObjectMetadata,
          flatFieldMetadataMaps: relationFieldMaps,
          selectedFields: { id: true, name: true, fund: true },
          selectableRelationFields:
            buildSelectableRelationFields(recordsPermissions),
          unreadableFieldMetadataIds:
            buildUnreadableFieldMetadataIds(recordsPermissions),
        });

      expect(effectiveSelectedFields).toEqual({ id: true, name: true });
      expect(warnings).toEqual([
        "Field 'fund' on investorLead cannot be selected because you do not have read access to company.",
      ]);
    });

    it('should warn when the relation field itself is restricted for the role', () => {
      const recordsPermissions = buildRecordsPermissions({
        sourceUnreadableFields: ['fund-field'],
      });

      const { effectiveSelectedFields, warnings } =
        buildEffectiveSelectedFields({
          select: ['name', 'fund'],
          filter: undefined,
          orderBy: undefined,
          objectName: 'investorLead',
          flatObjectMetadataMaps: relationObjectMaps,
          flatObjectMetadata: investorLeadObjectMetadata,
          flatFieldMetadataMaps: relationFieldMaps,
          selectedFields: { id: true, name: true, fund: true },
          selectableRelationFields:
            buildSelectableRelationFields(recordsPermissions),
          unreadableFieldMetadataIds:
            buildUnreadableFieldMetadataIds(recordsPermissions),
        });

      expect(effectiveSelectedFields).toEqual({ id: true, name: true });
      expect(warnings).toEqual([
        "Field 'fund' on investorLead cannot be selected because your role restricts access to this field.",
      ]);
    });

    it('should suggest relation field names for near-miss selections', () => {
      const recordsPermissions = buildRecordsPermissions({});

      const { warnings } = buildEffectiveSelectedFields({
        select: ['fundd'],
        filter: undefined,
        orderBy: undefined,
        objectName: 'investorLead',
        flatObjectMetadataMaps: relationObjectMaps,
        flatObjectMetadata: investorLeadObjectMetadata,
        flatFieldMetadataMaps: relationFieldMaps,
        selectedFields: { id: true, name: true, fund: true },
        selectableRelationFields:
          buildSelectableRelationFields(recordsPermissions),
        unreadableFieldMetadataIds:
          buildUnreadableFieldMetadataIds(recordsPermissions),
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("'fund'");
    });
  });
});
