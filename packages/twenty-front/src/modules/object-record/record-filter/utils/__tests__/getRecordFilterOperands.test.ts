import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type FilterableAndTSVectorFieldType } from 'twenty-shared/types';

const filterTypesWithoutSubField: FilterableAndTSVectorFieldType[] = [
  'TEXT',
  'EMAILS',
  'FULL_NAME',
  'ADDRESS',
  'LINKS',
  'PHONES',
  'NUMBER',
  'RAW_JSON',
  'FILES',
  'DATE_TIME',
  'DATE',
  'RATING',
  'RELATION',
  'MULTI_SELECT',
  'SELECT',
  'ARRAY',
  'BOOLEAN',
  'UUID',
  'TS_VECTOR',
];

describe('getRecordFilterOperands', () => {
  it.each(filterTypesWithoutSubField)(
    'returns the expected operands for filterType=%s',
    (filterType) => {
      const operands = getRecordFilterOperands({
        filterType,
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    },
  );

  describe('CURRENCY', () => {
    it('returns currencyCode operands when subFieldName is currencyCode', () => {
      const operands = getRecordFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: 'currencyCode',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns amountMicros operands when subFieldName is amountMicros', () => {
      const operands = getRecordFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: 'amountMicros',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns amountMicros operands when subFieldName is undefined', () => {
      const operands = getRecordFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    });
  });

  describe('ACTOR', () => {
    it('returns IS/IS_NOT operands when subFieldName is source (actor source subField)', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'source',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns IS/IS_NOT operands when subFieldName is workspaceMemberId (actor wsMember subField)', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'workspaceMemberId',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns ACTOR (text-like) operands when subFieldName is undefined', () => {
      const operands = getRecordFilterOperands({
        filterType: 'ACTOR',
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    });
  });
});
