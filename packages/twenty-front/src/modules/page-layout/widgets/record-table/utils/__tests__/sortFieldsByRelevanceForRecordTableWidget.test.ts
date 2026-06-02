import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { sortFieldsByRelevanceForRecordTableWidget } from '@/page-layout/widgets/record-table/utils/sortFieldsByRelevanceForRecordTableWidget';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const createField = (
  overrides: Partial<FieldMetadataItem> & { id: string },
): FieldMetadataItem =>
  ({
    name: 'field',
    label: 'Field',
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    settings: null,
    ...overrides,
  }) as FieldMetadataItem;

describe('sortFieldsByRelevanceForRecordTableWidget', () => {
  const labelIdentifierId = 'label-field-id';
  const sorter = sortFieldsByRelevanceForRecordTableWidget(labelIdentifierId);

  it('should place the label identifier field first', () => {
    const labelField = createField({ id: labelIdentifierId });
    const textField = createField({ id: 'text-1' });

    expect(sorter(labelField, textField)).toBe(-1);
    expect(sorter(textField, labelField)).toBe(1);
  });

  it('should place ONE_TO_MANY relation fields after non-relation fields', () => {
    const reverseSide = createField({
      id: 'reverse-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });
    const textField = createField({ id: 'text-1' });

    expect(sorter(reverseSide, textField)).toBe(1);
    expect(sorter(textField, reverseSide)).toBe(-1);
  });

  it('should place regular relation fields after non-relation fields', () => {
    const relation = createField({
      id: 'rel-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
    });
    const textField = createField({ id: 'text-1' });

    expect(sorter(relation, textField)).toBe(1);
    expect(sorter(textField, relation)).toBe(-1);
  });

  it('should place ONE_TO_MANY relations after MANY_TO_ONE relations', () => {
    const reverseSide = createField({
      id: 'reverse-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });
    const manyToOne = createField({
      id: 'rel-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
    });

    expect(sorter(reverseSide, manyToOne)).toBe(1);
    expect(sorter(manyToOne, reverseSide)).toBe(-1);
  });

  it('should return 0 for two non-relation fields of equal priority', () => {
    const fieldA = createField({ id: 'a' });
    const fieldB = createField({ id: 'b' });

    expect(sorter(fieldA, fieldB)).toBe(0);
  });

  it('should return 0 for two ONE_TO_MANY relation fields', () => {
    const reverseA = createField({
      id: 'reverse-a',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });
    const reverseB = createField({
      id: 'reverse-b',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });

    expect(sorter(reverseA, reverseB)).toBe(0);
  });

  it('should produce a correct full sort order', () => {
    const labelField = createField({ id: labelIdentifierId });
    const textField = createField({ id: 'text-1' });
    const numberField = createField({
      id: 'number-1',
      type: FieldMetadataType.NUMBER,
    });
    const manyToOneField = createField({
      id: 'rel-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.MANY_TO_ONE },
    });
    const oneToManyField = createField({
      id: 'reverse-1',
      type: FieldMetadataType.RELATION,
      settings: { relationType: RelationType.ONE_TO_MANY },
    });

    const fields = [
      oneToManyField,
      manyToOneField,
      textField,
      numberField,
      labelField,
    ];

    const sorted = [...fields].sort(sorter);

    expect(sorted[0].id).toBe(labelIdentifierId);
    expect(sorted[sorted.length - 1].id).toBe('reverse-1');
    const labelIdx = sorted.findIndex((f) => f.id === labelIdentifierId);
    const textIdx = sorted.findIndex((f) => f.id === 'text-1');
    const relIdx = sorted.findIndex((f) => f.id === 'rel-1');
    const reverseIdx = sorted.findIndex((f) => f.id === 'reverse-1');
    expect(labelIdx).toBeLessThan(textIdx);
    expect(textIdx).toBeLessThan(relIdx);
    expect(relIdx).toBeLessThan(reverseIdx);
  });
});
