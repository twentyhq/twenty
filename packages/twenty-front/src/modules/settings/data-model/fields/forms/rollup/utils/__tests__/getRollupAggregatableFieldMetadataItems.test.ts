import { getRollupAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatableFieldMetadataItems';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

const buildField = ({
  name,
  type,
  isActive = true,
  isSystem = false,
}: {
  name: string;
  type: FieldMetadataType;
  isActive?: boolean;
  isSystem?: boolean;
}) => ({ name, type, isActive, isSystem, settings: null });

const FIELDS = [
  buildField({ name: 'amount', type: FieldMetadataType.NUMBER }),
  buildField({ name: 'closeDate', type: FieldMetadataType.DATE_TIME }),
  buildField({ name: 'name', type: FieldMetadataType.TEXT }),
  buildField({
    name: 'position',
    type: FieldMetadataType.NUMBER,
    isSystem: true,
  }),
  buildField({
    name: 'legacy',
    type: FieldMetadataType.NUMBER,
    isActive: false,
  }),
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
