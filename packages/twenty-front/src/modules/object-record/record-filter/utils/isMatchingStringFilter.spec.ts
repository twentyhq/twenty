import { isMatchingStringFilter } from '@/object-record/record-filter/utils/isMatchingStringFilter';

describe('isMatchingStringFilter', () => {
  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { eq: 'test' }, value: 'test' }),
      ).toBe(true);
    });

    it('value does not equals eq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { eq: 'test' },
          value: 'other',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { neq: 'test' },
          value: 'other',
        }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { neq: 'test' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe('like', () => {
    it('value matches like pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'te%' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match like pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'ab%' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe('ilike', () => {
    it('value matches ilike pattern case insensitively', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'TE%' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match ilike pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'AB%' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { in: ['test', 'example'] },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { in: ['example', 'sample'] },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { is: 'NOT_NULL' },
          value: 'test',
        }),
      ).toBe(true);
    });
  });

  describe('regex', () => {
    it('value matches regex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { regex: '^test$' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match regex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { regex: '^test$' },
          value: 'testing',
        }),
      ).toBe(false);
    });
  });

  describe('iregex', () => {
    it('value matches iregex pattern case insensitively', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { iregex: '^test$' },
          value: 'Test',
        }),
      ).toBe(true);
    });

    it('value does not match iregex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { iregex: '^test$' },
          value: 'testing',
        }),
      ).toBe(false);
    });
  });

  describe('gt', () => {
    it('value is greater than gt filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { gt: 'a' }, value: 'b' }),
      ).toBe(true);
    });

    it('value is not greater than gt filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { gt: 'b' }, value: 'a' }),
      ).toBe(false);
    });
  });

  describe('gte', () => {
    it('value is greater than or equal to gte filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { gte: 'a' }, value: 'a' }),
      ).toBe(true);
    });

    it('value is not greater than or equal to gte filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { gte: 'b' }, value: 'a' }),
      ).toBe(false);
    });
  });

  describe('lt', () => {
    it('value is less than lt filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { lt: 'b' }, value: 'a' }),
      ).toBe(true);
    });

    it('value is not less than lt filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { lt: 'a' }, value: 'b' }),
      ).toBe(false);
    });
  });

  describe('lte', () => {
    it('value is less than or equal to lte filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { lte: 'a' }, value: 'a' }),
      ).toBe(true);
    });

    it('value is not less than or equal to lte filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { lte: 'a' }, value: 'b' }),
      ).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('value starts with the startsWith filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { startsWith: 'te' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not start with the startsWith filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { startsWith: 'st' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });
});
