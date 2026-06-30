import { getStepFilterOperands } from '@/workflow/workflow-steps/filters/utils/getStepFilterOperands';

const filterTypesWithoutSubField = [
  'TEXT',
  'EMAILS',
  'FULL_NAME',
  'ADDRESS',
  'LINKS',
  'PHONES',
  'NUMBER',
  'number',
  'RAW_JSON',
  'DATE_TIME',
  'DATE',
  'RATING',
  'RELATION',
  'MULTI_SELECT',
  'SELECT',
  'ARRAY',
  'array',
  'BOOLEAN',
  'boolean',
  'UUID',
  'NUMERIC',
  'UNKNOWN_TYPE_FALLS_THROUGH',
  undefined,
] as const;

describe('getStepFilterOperands', () => {
  it.each(filterTypesWithoutSubField)(
    'returns the expected operands for filterType=%s',
    (filterType) => {
      const operands = getStepFilterOperands({
        filterType,
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    },
  );

  describe('CURRENCY', () => {
    it('returns currencyCode operands when subFieldName is currencyCode', () => {
      const operands = getStepFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: 'currencyCode',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns amountMicros operands when subFieldName is amountMicros', () => {
      const operands = getStepFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: 'amountMicros',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns amountMicros operands when subFieldName is undefined', () => {
      const operands = getStepFilterOperands({
        filterType: 'CURRENCY',
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    });
  });

  describe('ACTOR', () => {
    it('returns SELECT operands when subFieldName is source', () => {
      const operands = getStepFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'source',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns RELATION operands when subFieldName is workspaceMemberId', () => {
      const operands = getStepFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'workspaceMemberId',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns TEXT operands when subFieldName is unknown', () => {
      const operands = getStepFilterOperands({
        filterType: 'ACTOR',
        subFieldName: 'someUnknownSubField',
      });

      expect(operands).toMatchSnapshot();
    });

    it('returns TEXT operands when subFieldName is undefined', () => {
      const operands = getStepFilterOperands({
        filterType: 'ACTOR',
        subFieldName: undefined,
      });

      expect(operands).toMatchSnapshot();
    });
  });
});
