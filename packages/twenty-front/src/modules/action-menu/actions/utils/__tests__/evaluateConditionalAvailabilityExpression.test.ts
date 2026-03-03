import { evaluateConditionalAvailabilityExpression } from '../evaluateConditionalAvailabilityExpression';

describe('evaluateConditionalAvailabilityExpression', () => {
  describe('null/undefined/empty expressions', () => {
    it('should return true for null expression', () => {
      expect(evaluateConditionalAvailabilityExpression(null, {})).toBe(true);
    });

    it('should return true for undefined expression', () => {
      expect(evaluateConditionalAvailabilityExpression(undefined, {})).toBe(
        true,
      );
    });

    it('should return true for empty string expression', () => {
      expect(evaluateConditionalAvailabilityExpression('', {})).toBe(true);
    });
  });

  describe('boolean literals', () => {
    it('should evaluate "true" to true', () => {
      expect(evaluateConditionalAvailabilityExpression('true', {})).toBe(true);
    });

    it('should evaluate "false" to false', () => {
      expect(evaluateConditionalAvailabilityExpression('false', {})).toBe(
        false,
      );
    });
  });

  describe('simple variable access', () => {
    it('should evaluate a truthy variable to true', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isShowPage', {
          isShowPage: true,
        }),
      ).toBe(true);
    });

    it('should evaluate a falsy variable to false', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isShowPage', {
          isShowPage: false,
        }),
      ).toBe(false);
    });
  });

  describe('dot notation property access', () => {
    it('should access nested properties', () => {
      expect(
        evaluateConditionalAvailabilityExpression(
          'objectPermissions.canUpdateObjectRecords',
          {
            objectPermissions: { canUpdateObjectRecords: true },
          },
        ),
      ).toBe(true);
    });

    it('should return false for missing nested properties', () => {
      expect(
        evaluateConditionalAvailabilityExpression(
          'objectPermissions.canUpdateObjectRecords',
          {},
        ),
      ).toBe(false);
    });
  });

  describe('logical operators', () => {
    it('should evaluate "and" operator', () => {
      expect(
        evaluateConditionalAvailabilityExpression('a and b', {
          a: true,
          b: true,
        }),
      ).toBe(true);

      expect(
        evaluateConditionalAvailabilityExpression('a and b', {
          a: true,
          b: false,
        }),
      ).toBe(false);
    });

    it('should evaluate "or" operator', () => {
      expect(
        evaluateConditionalAvailabilityExpression('a or b', {
          a: false,
          b: true,
        }),
      ).toBe(true);

      expect(
        evaluateConditionalAvailabilityExpression('a or b', {
          a: false,
          b: false,
        }),
      ).toBe(false);
    });

    it('should evaluate "not" operator', () => {
      expect(
        evaluateConditionalAvailabilityExpression('not a', {
          a: false,
        }),
      ).toBe(true);

      expect(
        evaluateConditionalAvailabilityExpression('not a', {
          a: true,
        }),
      ).toBe(false);
    });
  });

  describe('comparison operators', () => {
    it('should evaluate numeric comparisons', () => {
      expect(
        evaluateConditionalAvailabilityExpression(
          'numberOfSelectedRecords > 0',
          { numberOfSelectedRecords: 3 },
        ),
      ).toBe(true);

      expect(
        evaluateConditionalAvailabilityExpression(
          'numberOfSelectedRecords == 1',
          { numberOfSelectedRecords: 1 },
        ),
      ).toBe(true);
    });
  });

  describe('custom functions', () => {
    it('should evaluate isDefined for defined values', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isDefined(selectedRecord)', {
          selectedRecord: { id: '123' },
        }),
      ).toBe(true);
    });

    it('should evaluate isDefined for null values', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isDefined(selectedRecord)', {
          selectedRecord: null,
        }),
      ).toBe(false);
    });

    it('should evaluate isNonEmptyString for non-empty strings', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isNonEmptyString(label)', {
          label: 'hello',
        }),
      ).toBe(true);
    });

    it('should evaluate isNonEmptyString for empty strings', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isNonEmptyString(label)', {
          label: '',
        }),
      ).toBe(false);
    });
  });

  describe('complex expressions', () => {
    it('should evaluate complex combined expressions', () => {
      expect(
        evaluateConditionalAvailabilityExpression(
          'objectPermissions.canUpdateObjectRecords and not isInRightDrawer',
          {
            objectPermissions: { canUpdateObjectRecords: true },
            isInRightDrawer: false,
          },
        ),
      ).toBe(true);
    });

    it('should evaluate ternary expressions', () => {
      expect(
        evaluateConditionalAvailabilityExpression('isShowPage ? true : false', {
          isShowPage: true,
        }),
      ).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return false for invalid expressions', () => {
      expect(
        evaluateConditionalAvailabilityExpression(
          'this is not a valid expression !!!',
          {},
        ),
      ).toBe(false);
    });

    it('should return false when referenced variables are missing', () => {
      expect(
        evaluateConditionalAvailabilityExpression('someUndefinedVariable', {}),
      ).toBe(false);
    });
  });
});
