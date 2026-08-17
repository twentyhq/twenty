import { describe, expect, it } from 'vitest';
import {
  areFieldsListsIdentical,
  areMorphRelationsIdentical,
  areObjectsIdentical,
  areRelationsIdentical,
} from 'src/logic-functions/entry-point';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldRelationInfo, FieldsListType, ObjectType, ObjectOpenRecordIn, RelationType } from 'src/logic-functions/types/find-objects-fields.type';

const buildObject = (overrides: Partial<ObjectType> = {}): ObjectType => ({
  applicationId: 'app-1',
  color: 'blue',
  description: 'A company',
  fieldsList: [],
  icon: 'IconBuilding',
  id: 'object-1',
  isActive: true,
  isLabelSyncedWithName: false,
  isSystem: false,
  labelIdentifierFieldMetadataId: 'field-name',
  labelPlural: 'Companies',
  labelSingular: 'Company',
  namePlural: 'companies',
  nameSingular: 'company',
  openRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
  universalIdentifier: 'universal-object-1',
  ...overrides,
});

const baseField = {
  applicationId: 'app-1',
  description: '',
  icon: 'IconText',
  id: 'field-1',
  isActive: true,
  isLabelSyncedWithName: false,
  isNullable: true,
  isSystem: false,
  isUIEditable: true,
  isUIReadOnly: false,
  isUnique: false,
  label: 'Name',
  morphId: null,
  name: 'name',
  objectMetadataId: 'object-1',
  universalIdentifier: 'universal-field-1',
};

const buildTextField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  type: FieldMetadataType.TEXT,
  defaultValue: null,
  settings: null,
  options: null,
  relation: null,
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildNumberField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-number-1',
  name: 'score',
  type: FieldMetadataType.NUMBER,
  defaultValue: null,
  settings: { decimals: 2 },
  options: null,
  relation: null,
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildCurrencyField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-currency-1',
  name: 'amount',
  type: FieldMetadataType.CURRENCY,
  defaultValue: { amountMicros: '1000000', currencyCode: 'USD' },
  settings: null,
  options: null,
  relation: null,
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildRelation = (overrides: Partial<FieldRelationInfo> = {}): FieldRelationInfo => ({
  type: RelationType.MANY_TO_ONE,
  targetObjectMetadata: { nameSingular: 'company' },
  targetFieldMetadata: { icon: 'IconBuilding', label: 'Companies' },
  ...overrides,
});

const buildRelationField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-relation-1',
  name: 'company',
  type: FieldMetadataType.RELATION,
  defaultValue: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
  options: null,
  relation: buildRelation(),
  morphRelations: null,
  ...overrides,
} as FieldsListType);

const buildMorphRelationField = (overrides: Partial<FieldsListType> = {}): FieldsListType => ({
  ...baseField,
  id: 'field-morph-1',
  name: 'target',
  type: FieldMetadataType.MORPH_RELATION,
  defaultValue: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
  options: null,
  relation: null,
  morphRelations: [
    buildRelation({ targetObjectMetadata: { nameSingular: 'company' }, targetFieldMetadata: { icon: 'IconBuilding', label: 'Notes' } }),
    buildRelation({ targetObjectMetadata: { nameSingular: 'person' }, targetFieldMetadata: { icon: 'IconUser', label: 'Notes' } }),
  ],
  ...overrides,
} as FieldsListType);

describe('areObjectsIdentical', () => {
  it('returns true when every compared field matches', () => {
    expect(areObjectsIdentical(buildObject(), buildObject())).toBe(true);
  });

  it('returns false when icon differs', () => {
    expect(areObjectsIdentical(buildObject(), buildObject({ icon: 'IconOther' }))).toBe(false);
  });

  it('returns false when labelPlural differs', () => {
    expect(areObjectsIdentical(buildObject(), buildObject({ labelPlural: 'Businesses' }))).toBe(false);
  });

  it('ignores fields not part of the comparison (e.g. id, universalIdentifier)', () => {
    expect(areObjectsIdentical(buildObject({ id: 'a' }), buildObject({ id: 'b' }))).toBe(true);
  });
});

describe('areRelationsIdentical', () => {
  it('returns true for matching relation info', () => {
    expect(areRelationsIdentical(buildRelation(), buildRelation())).toBe(true);
  });

  it('returns false when the target object differs', () => {
    expect(
      areRelationsIdentical(buildRelation(), buildRelation({ targetObjectMetadata: { nameSingular: 'person' } })),
    ).toBe(false);
  });

  it('returns false when the target field icon differs', () => {
    expect(
      areRelationsIdentical(buildRelation(), buildRelation({ targetFieldMetadata: { icon: 'IconOther', label: 'Companies' } })),
    ).toBe(false);
  });
});

describe('areMorphRelationsIdentical', () => {
  const companyRelation = buildRelation({ targetObjectMetadata: { nameSingular: 'company' } });
  const personRelation = buildRelation({ targetObjectMetadata: { nameSingular: 'person' } });

  it('returns true for the same set in the same order', () => {
    expect(areMorphRelationsIdentical([companyRelation, personRelation], [companyRelation, personRelation])).toBe(true);
  });

  it('returns true for the same set in a different order (order-independent by design)', () => {
    expect(areMorphRelationsIdentical([companyRelation, personRelation], [personRelation, companyRelation])).toBe(true);
  });

  it('returns false when lengths differ', () => {
    expect(areMorphRelationsIdentical([companyRelation, personRelation], [companyRelation])).toBe(false);
  });

  it('returns false when the target sets differ', () => {
    const opportunityRelation = buildRelation({ targetObjectMetadata: { nameSingular: 'opportunity' } });
    expect(areMorphRelationsIdentical([companyRelation, personRelation], [companyRelation, opportunityRelation])).toBe(false);
  });
});

describe('areFieldsListsIdentical', () => {
  it('treats equal-content settings objects as identical even when they are different references (TEXT)', () => {
    // Regression test: this comparison used to be `a.settings === b.settings` (reference
    // equality), which was always false for two independently-fetched objects even when their
    // content matched byte-for-byte.
    const a = buildTextField({ settings: { displayedMaxRows: 3 } });
    const b = buildTextField({ settings: { displayedMaxRows: 3 } });
    expect(a.settings).not.toBe(b.settings);
    expect(areFieldsListsIdentical(a, b)).toBe(true);
  });

  it('detects a real settings difference (NUMBER)', () => {
    expect(areFieldsListsIdentical(buildNumberField(), buildNumberField({ settings: { decimals: 3 } }))).toBe(false);
  });

  it('treats equal-content default values as identical even when they are different references (CURRENCY)', () => {
    const a = buildCurrencyField();
    const b = buildCurrencyField({ defaultValue: { amountMicros: '1000000', currencyCode: 'USD' } });
    expect(a.defaultValue).not.toBe(b.defaultValue);
    expect(areFieldsListsIdentical(a, b)).toBe(true);
  });

  it('detects a real default value difference (CURRENCY)', () => {
    expect(
      areFieldsListsIdentical(buildCurrencyField(), buildCurrencyField({ defaultValue: { amountMicros: '2000000', currencyCode: 'USD' } })),
    ).toBe(false);
  });

  it('compares RELATION fields via relation target, not just scalar props', () => {
    expect(areFieldsListsIdentical(buildRelationField(), buildRelationField())).toBe(true);
    expect(
      areFieldsListsIdentical(buildRelationField(), buildRelationField({ relation: buildRelation({ targetObjectMetadata: { nameSingular: 'person' } }) })),
    ).toBe(false);
  });

  it('compares MORPH_RELATION fields order-independently', () => {
    const reordered = buildMorphRelationField({
      morphRelations: [...buildMorphRelationField().morphRelations!].reverse(),
    });
    expect(areFieldsListsIdentical(buildMorphRelationField(), reordered)).toBe(true);
  });

  it('detects a real morph relation target difference', () => {
    const changed = buildMorphRelationField({
      morphRelations: [buildRelation({ targetObjectMetadata: { nameSingular: 'company' } })],
    });
    expect(areFieldsListsIdentical(buildMorphRelationField(), changed)).toBe(false);
  });

  it('never treats fields of different types as identical', () => {
    expect(areFieldsListsIdentical(buildTextField(), buildNumberField())).toBe(false);
  });
});
