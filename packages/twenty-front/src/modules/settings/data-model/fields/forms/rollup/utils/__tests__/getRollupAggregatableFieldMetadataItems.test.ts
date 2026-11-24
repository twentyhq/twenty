import { getRollupAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatableFieldMetadataItems';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

const buildField = (
  name: string,
  type: FieldMetadataType,
  overrides: { isActive?: boolean; isSystem?: boolean } = {},
) => ({
  name,
  type,
  isActive: true,
  isSystem: false,
  settings: null,
  ...overrides,
});

const FIELDS = [
  buildField('amount', FieldMetadataType.NUMBER),
  buildField('closeDate', FieldMetadataType.DATE_TIME),
  buildField('name', FieldMetadataType.TEXT),
  buildField('position', FieldMetadataType.NUMBER, { isSystem: true }),
  buildField('legacy', FieldMetadataType.NUMBER, { isActive: false }),
];

const getNames = (
  aggregateOperation: AggregateOperations.SUM | AggregateOperations.MAX,
) =>
  getRollupAggregatableFieldMetadataItems({
    fieldMetadataItems: FIELDS,
    aggregateOperation,
  }).map(({ name }) => name);

describe('getRollupAggregatableFieldMetadataItems', () => {
  it('should offer active number fields for a sum', () => {
    expect(getNames(AggregateOperations.SUM)).toEqual(['amount']);
  });

  it('should offer number and date fields for a max', () => {
    expect(getNames(AggregateOperations.MAX)).toEqual(['amount', 'closeDate']);
  });
});
