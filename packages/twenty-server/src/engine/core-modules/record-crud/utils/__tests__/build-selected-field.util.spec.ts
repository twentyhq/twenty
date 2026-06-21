import { FieldMetadataType } from 'twenty-shared/types';

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
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
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
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: defaultSelectedFields,
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
          flatObjectMetadata: defaultFlatObjectMetadata,
          flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
          selectedFields: defaultSelectedFields,
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
        flatObjectMetadata: defaultFlatObjectMetadata,
        flatFieldMetadataMaps: defaultFlatFieldMetadataMaps,
        selectedFields: {
          id: true,
          richText: { blocknote: true, markdown: true },
        },
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
        flatObjectMetadata: nonRichTextObjectMetadata,
        flatFieldMetadataMaps: nonRichTextMaps,
        selectedFields: {
          id: true,
          name: true,
          richText: { blocknote: true, markdown: true },
        },
      });

      const richTextFields =
        effectiveSelectedFields.richText as CommonSelectedFields;

      expect(richTextFields).toHaveProperty('blocknote');
      expect(richTextFields).toHaveProperty('markdown');
    });
  });
});
