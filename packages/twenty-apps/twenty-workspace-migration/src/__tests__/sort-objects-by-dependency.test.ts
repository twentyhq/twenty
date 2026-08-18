import { describe, expect, it } from 'vitest';
import { sortObjectsByDependency } from 'src/logic-functions/utils/sort-objects-by-dependency.util';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import { FieldsListType, ObjectOpenRecordIn, ObjectType, RelationType } from 'src/logic-functions/types/find-objects-fields.type';

const buildObject = (nameSingular: string, universalIdentifier: string, fieldsList: FieldsListType[] = []): ObjectType => ({
  applicationId: 'app-1',
  color: 'blue',
  description: '',
  fieldsList,
  icon: 'IconBox',
  id: `id-${nameSingular}`,
  isActive: true,
  isLabelSyncedWithName: false,
  isSystem: false,
  labelIdentifierFieldMetadataId: 'field-name',
  labelPlural: nameSingular,
  labelSingular: nameSingular,
  namePlural: `${nameSingular}s`,
  nameSingular,
  openRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
  universalIdentifier,
});

const baseField = {
  applicationId: 'app-1',
  description: '',
  icon: 'IconLink',
  id: 'field-1',
  isActive: true,
  isLabelSyncedWithName: false,
  isNullable: true,
  isSystem: false,
  isUIEditable: true,
  isUIReadOnly: false,
  isUnique: false,
  label: 'Target',
  morphId: null,
  name: 'target',
  objectMetadataId: 'object-1',
  universalIdentifier: 'universal-field-1',
};

const buildRelationField = (targetNameSingular: string, relationType: RelationType): FieldsListType => ({
  ...baseField,
  type: FieldMetadataType.RELATION,
  defaultValue: null,
  settings: { relationType },
  options: null,
  relation: {
    type: relationType,
    targetObjectMetadata: { nameSingular: targetNameSingular },
    targetFieldMetadata: { icon: 'IconLink', label: targetNameSingular },
  },
  morphRelations: null,
} as FieldsListType);

const buildMorphRelationField = (targetNameSingular: string): FieldsListType => ({
  ...baseField,
  type: FieldMetadataType.MORPH_RELATION,
  defaultValue: null,
  settings: { relationType: RelationType.MANY_TO_ONE },
  options: null,
  relation: null,
  morphRelations: [{
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: targetNameSingular },
    targetFieldMetadata: { icon: 'IconLink', label: targetNameSingular },
  }],
} as FieldsListType);

describe('sortObjectsByDependency', () => {
  it('orders a MANY_TO_ONE relation target before the object that points at it', () => {
    const company = buildObject('company', 'u-company');
    const person = buildObject('person', 'u-person', [buildRelationField('company', RelationType.MANY_TO_ONE)]);

    const result = sortObjectsByDependency([person, company]);

    expect(result.map((object) => object.nameSingular)).toEqual(['company', 'person']);
  });

  it('preserves relative order for objects with no dependency relationship', () => {
    const a = buildObject('a', 'u-a');
    const b = buildObject('b', 'u-b');

    const result = sortObjectsByDependency([a, b]);

    expect(result.map((object) => object.nameSingular)).toEqual(['a', 'b']);
  });

  it('does not let a ONE_TO_MANY relation field impose ordering', () => {
    const company = buildObject('company', 'u-company', [buildRelationField('person', RelationType.ONE_TO_MANY)]);
    const person = buildObject('person', 'u-person');

    const result = sortObjectsByDependency([company, person]);

    expect(result.map((object) => object.nameSingular)).toEqual(['company', 'person']);
  });

  it('ignores MORPH_RELATION fields entirely, even ones shaped like a MANY_TO_ONE target', () => {
    const note = buildObject('note', 'u-note', [buildMorphRelationField('company')]);
    const company = buildObject('company', 'u-company');

    const result = sortObjectsByDependency([note, company]);

    expect(result.map((object) => object.nameSingular)).toEqual(['note', 'company']);
  });

  it('treats a relation target absent from the input list as no constraint', () => {
    const person = buildObject('person', 'u-person', [buildRelationField('company', RelationType.MANY_TO_ONE)]);

    const result = sortObjectsByDependency([person]);

    expect(result.map((object) => object.nameSingular)).toEqual(['person']);
  });

  it('resolves a multi-level chain so each target precedes its dependents', () => {
    const company = buildObject('company', 'u-company');
    const person = buildObject('person', 'u-person', [buildRelationField('company', RelationType.MANY_TO_ONE)]);
    const opportunity = buildObject('opportunity', 'u-opportunity', [buildRelationField('person', RelationType.MANY_TO_ONE)]);

    const order = sortObjectsByDependency([opportunity, company, person]).map((object) => object.nameSingular);

    expect(order.indexOf('company')).toBeLessThan(order.indexOf('person'));
    expect(order.indexOf('person')).toBeLessThan(order.indexOf('opportunity'));
  });

  it('breaks a circular MANY_TO_ONE dependency instead of looping forever, keeping every object exactly once', () => {
    const a = buildObject('a', 'u-a', [buildRelationField('b', RelationType.MANY_TO_ONE)]);
    const b = buildObject('b', 'u-b', [buildRelationField('a', RelationType.MANY_TO_ONE)]);

    const result = sortObjectsByDependency([a, b]);

    expect(result.map((object) => object.nameSingular).sort()).toEqual(['a', 'b']);
  });

  it('ignores a relation field that targets the object itself', () => {
    const a = buildObject('a', 'u-a', [buildRelationField('a', RelationType.MANY_TO_ONE)]);

    const result = sortObjectsByDependency([a]);

    expect(result.map((object) => object.nameSingular)).toEqual(['a']);
  });
});
