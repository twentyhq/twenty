import { validateViewFilterOperands } from '@/cli/utilities/build/manifest/utils/validate-view-filter-operands';
import {
  type FieldManifest,
  type ObjectFieldManifest,
  type ObjectManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  ViewFilterOperand,
  ViewType,
} from 'twenty-shared/types';

const buildField = <T extends FieldMetadataType>({
  universalIdentifier,
  type,
  name = 'field',
  label = 'Field',
}: {
  universalIdentifier: string;
  type: T;
  name?: string;
  label?: string;
}): FieldManifest<T> =>
  ({
    universalIdentifier,
    objectUniversalIdentifier: 'object-uid',
    name,
    label,
    type,
  }) as FieldManifest<T>;

const buildRelationField = ({
  universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier,
  name = 'relation',
  label = 'Relation',
}: {
  universalIdentifier: string;
  relationTargetFieldMetadataUniversalIdentifier: string;
  name?: string;
  label?: string;
}): FieldManifest<FieldMetadataType.RELATION> =>
  ({
    universalIdentifier,
    objectUniversalIdentifier: 'object-uid',
    name,
    label,
    type: FieldMetadataType.RELATION,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: 'target-object-uid',
    universalSettings: {},
  }) as FieldManifest<FieldMetadataType.RELATION>;

const buildView = (filters: ViewManifest['filters']): ViewManifest => ({
  universalIdentifier: 'view-uid',
  name: 'View',
  objectUniversalIdentifier: 'object-uid',
  type: ViewType.TABLE,
  filters,
});

const buildObject = (fields: ObjectFieldManifest[]): ObjectManifest =>
  ({
    universalIdentifier: 'object-uid',
    nameSingular: 'company',
    namePlural: 'companies',
    labelSingular: 'Company',
    labelPlural: 'Companies',
    labelIdentifierFieldMetadataUniversalIdentifier:
      fields[0]?.universalIdentifier ?? '',
    fields,
  }) as ObjectManifest;

describe('validateViewFilterOperands', () => {
  it('should return no errors when operand is valid for the field type', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            operand: ViewFilterOperand.CONTAINS,
            value: 'acme',
          },
        ]),
      ],
      objects: [],
      fields: [
        buildField({
          universalIdentifier: 'field-uid',
          type: FieldMetadataType.TEXT,
          name: 'company',
        }),
      ],
    });

    expect(errors).toEqual([]);
  });

  it('should return an error when operand is invalid for the field type', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            operand: ViewFilterOperand.CONTAINS,
            value: '5',
          },
        ]),
      ],
      objects: [],
      fields: [
        buildField({
          universalIdentifier: 'field-uid',
          type: FieldMetadataType.NUMBER,
          name: 'rating',
        }),
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('CONTAINS');
    expect(errors[0]).toContain('rating');
    expect(errors[0]).toContain('NUMBER');
  });

  it('should resolve relation fields against their target field type', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'relation-field-uid',
            operand: ViewFilterOperand.IS,
            value: ['target-record-uid'],
          },
        ]),
      ],
      objects: [],
      fields: [
        buildRelationField({
          universalIdentifier: 'relation-field-uid',
          relationTargetFieldMetadataUniversalIdentifier: 'target-field-uid',
          name: 'company',
        }),
        buildField({
          universalIdentifier: 'target-field-uid',
          type: FieldMetadataType.UUID,
          name: 'id',
        }),
      ],
    });

    expect(errors).toEqual([]);
  });

  it('should fallback to RELATION operands when relation target field is missing', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'relation-field-uid',
            operand: ViewFilterOperand.IS,
            value: ['target-record-uid'],
          },
        ]),
      ],
      objects: [],
      fields: [
        buildRelationField({
          universalIdentifier: 'relation-field-uid',
          relationTargetFieldMetadataUniversalIdentifier: 'missing-target-uid',
          name: 'company',
        }),
      ],
    });

    expect(errors).toEqual([]);
  });

  it('should look up fields nested under objects', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'field-uid',
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '5',
          },
        ]),
      ],
      objects: [
        buildObject([
          buildField({
            universalIdentifier: 'field-uid',
            type: FieldMetadataType.TEXT,
            name: 'company',
          }),
        ]),
      ],
      fields: [],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('GREATER_THAN_OR_EQUAL');
    expect(errors[0]).toContain('TEXT');
  });

  it('should skip filters that reference unknown fields', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'unknown-field-uid',
            operand: ViewFilterOperand.CONTAINS,
            value: 'acme',
          },
        ]),
      ],
      objects: [],
      fields: [],
    });

    expect(errors).toEqual([]);
  });

  it('should respect CURRENCY subFieldName when checking operands', () => {
    const errors = validateViewFilterOperands({
      views: [
        buildView([
          {
            universalIdentifier: 'filter-uid',
            fieldMetadataUniversalIdentifier: 'amount-uid',
            operand: ViewFilterOperand.CONTAINS,
            value: 'USD',
            subFieldName: 'currencyCode',
          },
        ]),
      ],
      objects: [],
      fields: [
        buildField({
          universalIdentifier: 'amount-uid',
          type: FieldMetadataType.CURRENCY,
          name: 'amount',
        }),
      ],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('CONTAINS');
    expect(errors[0]).toContain('CURRENCY');
  });

  it('should return an empty array when no views are defined', () => {
    expect(
      validateViewFilterOperands({ views: [], objects: [], fields: [] }),
    ).toEqual([]);
  });
});
