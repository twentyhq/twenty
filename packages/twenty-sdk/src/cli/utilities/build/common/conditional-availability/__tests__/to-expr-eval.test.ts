import { toExprEval } from '@/cli/utilities/build/common/conditional-availability/utils/to-expr-eval';

describe('toExprEval', () => {
  describe('strict equality (===) to loose equality (==)', () => {
    it('should convert a single ===', () => {
      expect(toExprEval('a === b')).toBe('a == b');
    });

    it('should convert multiple ===', () => {
      expect(toExprEval('a === b === c')).toBe('a == b == c');
    });
  });

  describe('strict inequality (!==) to loose inequality (!=)', () => {
    it('should convert a single !==', () => {
      expect(toExprEval('a !== b')).toBe('a != b');
    });

    it('should convert multiple !==', () => {
      expect(toExprEval('a !== 0 !== b')).toBe('a != 0 != b');
    });
  });

  describe('logical AND (&&) to and', () => {
    it('should convert a single &&', () => {
      expect(toExprEval('a && b')).toBe('a and b');
    });

    it('should convert multiple &&', () => {
      expect(toExprEval('a && b && c')).toBe('a and b and c');
    });
  });

  describe('logical OR (||) to or', () => {
    it('should convert a single ||', () => {
      expect(toExprEval('a || b')).toBe('a or b');
    });

    it('should convert multiple ||', () => {
      expect(toExprEval('a || b || c')).toBe('a or b or c');
    });
  });

  describe('logical NOT (!) to not', () => {
    it('should convert a prefix !', () => {
      expect(toExprEval('!a')).toBe('not a');
    });

    it('should convert multiple prefix !', () => {
      expect(toExprEval('!a && !b')).toBe('not a and not b');
    });

    it('should not convert ! that is part of !==', () => {
      expect(toExprEval('a !== b')).toBe('a != b');
    });

    it('should not convert ! that is part of !=', () => {
      expect(toExprEval('a != b')).toBe('a != b');
    });
  });

  describe('combined operators', () => {
    it('should convert a complex expression with all operators', () => {
      expect(toExprEval('a && !b || c === 1 && d !== 0')).toBe(
        'a and not b or c == 1 and d != 0',
      );
    });

    it('should handle parenthesized expressions', () => {
      expect(toExprEval('(a || b) && !c')).toBe('(a or b) and not c');
    });

    it('should handle nested property access', () => {
      expect(toExprEval('obj.prop === true && !obj.other')).toBe(
        'obj.prop == true and not obj.other',
      );
    });
  });

  describe('edge cases', () => {
    it('should return an empty string unchanged', () => {
      expect(toExprEval('')).toBe('');
    });

    it('should return a plain identifier unchanged', () => {
      expect(toExprEval('isShowPage')).toBe('isShowPage');
    });

    it('should leave numeric comparisons intact', () => {
      expect(toExprEval('count > 0')).toBe('count > 0');
    });
  });
});
