import {
  FieldMetadataType,
  type ObjectsPermissions,
  RelationType,
} from 'twenty-shared/types';

import { getRelationsSelectFields } from 'src/engine/api/common/common-select-fields/utils/get-relations-select-fields.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { buildEffectiveSelectedFields } from 'src/engine/core-modules/record-crud/utils/build-effective-selected-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatFieldMetadataMaps = (
  fields: Array<{ id: string; name: string; type: FieldMetadataType }>,
): FlatEntityMaps<FlatFieldMetadata> => {
  const universalIdentifierById: Partial<Record<string, string>> = {};
  const byUniversalIdentifier: Partial<
    Record<string, Partial<FlatFieldMetadata>>
  > = {};

  for (const field of fields) {
    const uid = `uid-${field.id}`;

    universalIdentifierById[field.id] = uid;
    byUniversalIdentifier[uid] = { name: field.name, type: field.type };
  }

  return {
    universalIdentifierById,
    byUniversalIdentifier,
    universalIdentifiersByApplicationId: {},
  } as unknown as FlatEntityMaps<FlatFieldMetadata>;
};

const buildFlatObjectMetadata = (
  labelIdentifierFieldMetadataId: string | undefined,
  fieldIds: string[],
): FlatObjectMetadata =>
  ({
    labelIdentifierFieldMetadataId,
    fieldIds,
  }) as unknown as FlatObjectMetadata;

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
          objectsPermissions: {},
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
          objectsPermissions: {},
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
        objectsPermissions: {},
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
        objectsPermissions: {},
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
        objectsPermissions: {},
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
        objectsPermissions: {},
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
        objectsPermissions: {},
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
          objectsPermissions: {},
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
        objectsPermissions: {},
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
        objectsPermissions: {},
      });

      const richTextFields =
        effectiveSelectedFields.richText as CommonSelectedFields;

      expect(richTextFields).toHaveProperty('blocknote');
      expect(richTextFields).toHaveProperty('markdown');
    });
  });

  describe('relation field hydration', () => {
    const leadNameField = {
      id: FIELD_IDS.name,
      universalIdentifier: `uid-${FIELD_IDS.name}`,
      name: 'name',
      type: FieldMetadataType.TEXT,
    } as unknown as FlatFieldMetadata;
    const fundField = {
      id: 'fund-field',
      universalIdentifier: 'uid-fund-field',
      name: 'fund',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetObjectMetadataId: 'company-object-id',
      relationTargetFieldMetadataId: 'investor-pipeline-field',
    } as unknown as FlatFieldMetadata;
    const companyIdField = {
      id: 'company-id-field',
      universalIdentifier: 'uid-company-id-field',
      name: 'id',
      type: FieldMetadataType.UUID,
    } as unknown as FlatFieldMetadata;
    const companyNameField = {
      id: 'company-name-field',
      universalIdentifier: 'uid-company-name-field',
      name: 'name',
      type: FieldMetadataType.TEXT,
    } as unknown as FlatFieldMetadata;
    const investorPipelineField = {
      id: 'investor-pipeline-field',
      universalIdentifier: 'uid-investor-pipeline-field',
      name: 'investorPipeline',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
      relationTargetObjectMetadataId: 'investor-lead-object-id',
      relationTargetFieldMetadataId: 'fund-field',
    } as unknown as FlatFieldMetadata;

    const relationFieldMaps = {
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
    } as unknown as FlatEntityMaps<FlatFieldMetadata>;

    const investorLeadObjectMetadata = {
      id: 'investor-lead-object-id',
      universalIdentifier: 'uid-investor-lead-object-id',
      nameSingular: 'investorLead',
      labelIdentifierFieldMetadataId: FIELD_IDS.name,
      fieldIds: [FIELD_IDS.name, 'fund-field'],
    } as unknown as FlatObjectMetadata;
    const companyObjectMetadata = {
      id: 'company-object-id',
      universalIdentifier: 'uid-company-object-id',
      nameSingular: 'company',
      labelIdentifierFieldMetadataId: 'company-name-field',
      fieldIds: [
        'company-id-field',
        'company-name-field',
        'investor-pipeline-field',
      ],
    } as unknown as FlatObjectMetadata;

    const relationObjectMaps = {
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
    } as unknown as FlatEntityMaps<FlatObjectMetadata>;

    const buildObjectsPermissions = ({
      canReadCompany = true,
      sourceRestrictedFields = {},
    }: {
      canReadCompany?: boolean;
      sourceRestrictedFields?: Record<string, { canRead: boolean }>;
    }) =>
      ({
        'investor-lead-object-id': {
          canReadObjectRecords: true,
          restrictedFields: sourceRestrictedFields,
        },
        'company-object-id': {
          canReadObjectRecords: canReadCompany,
          restrictedFields: {},
        },
      }) as unknown as ObjectsPermissions;

    const buildSelectableRelationFields = (
      objectsPermissions: ObjectsPermissions,
    ) =>
      getRelationsSelectFields({
        flatObjectMetadataMaps: relationObjectMaps,
        flatFieldMetadataMaps: relationFieldMaps,
        flatObjectMetadata: investorLeadObjectMetadata,
        objectsPermissions,
        depth: 1,
        onlyUseLabelIdentifierFieldsInRelations: true,
      });

    it('should hydrate a selected one-to-many relation instead of its unresolvable boolean entry', () => {
      const objectsPermissions = buildObjectsPermissions({});

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
            buildSelectableRelationFields(objectsPermissions),
          objectsPermissions,
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should hydrate a selected relation that also appears in orderBy', () => {
      const objectsPermissions = buildObjectsPermissions({});

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
            buildSelectableRelationFields(objectsPermissions),
          objectsPermissions,
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should hydrate readable relations in wildcard selection', () => {
      const objectsPermissions = buildObjectsPermissions({});

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
            buildSelectableRelationFields(objectsPermissions),
          objectsPermissions,
        });

      expect(warnings).toEqual([]);
      expect(effectiveSelectedFields).toEqual({
        id: true,
        name: true,
        fund: { id: true, name: true },
      });
    });

    it('should warn when selecting a relation whose target is not readable', () => {
      const objectsPermissions = buildObjectsPermissions({
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
            buildSelectableRelationFields(objectsPermissions),
          objectsPermissions,
        });

      expect(effectiveSelectedFields).toEqual({ id: true, name: true });
      expect(warnings).toEqual([
        "Field 'fund' on investorLead cannot be selected because you do not have read access to company.",
      ]);
    });

    it('should warn when the relation field itself is restricted for the role', () => {
      const objectsPermissions = buildObjectsPermissions({
        sourceRestrictedFields: { 'fund-field': { canRead: false } },
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
            buildSelectableRelationFields(objectsPermissions),
          objectsPermissions,
        });

      expect(effectiveSelectedFields).toEqual({ id: true, name: true });
      expect(warnings).toEqual([
        "Field 'fund' on investorLead cannot be selected because your role restricts access to this field.",
      ]);
    });

    it('should suggest relation field names for near-miss selections', () => {
      const objectsPermissions = buildObjectsPermissions({});

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
          buildSelectableRelationFields(objectsPermissions),
        objectsPermissions,
      });

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("'fund'");
    });
  });
});
