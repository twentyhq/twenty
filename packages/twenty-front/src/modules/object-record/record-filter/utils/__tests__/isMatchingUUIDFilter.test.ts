import { isMatchingUUIDFilter } from '@/object-record/record-filter/utils/isMatchingUUIDFilter';

describe('isMatchingUUIDFilter', () => {
  const testUUID = '123e4567-e89b-12d3-a456-426655440000';

  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingUUIDFilter({ uuidFilter: { eq: testUUID }, value: testUUID }),
      ).toBe(true);
    });

    it('value does not equal eq filter', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { eq: testUUID },
          value: 'different-uuid',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { neq: testUUID },
          value: 'different-uuid',
        }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { neq: testUUID },
          value: testUUID,
        }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { in: [testUUID, 'another-uuid'] },
          value: testUUID,
        }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { in: ['another-uuid', 'yet-another-uuid'] },
          value: testUUID,
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingUUIDFilter({
          uuidFilter: { is: 'NOT_NULL' },
          value: testUUID,
        }),
      ).toBe(true);
    });
  });
});
