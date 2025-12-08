import { hasJsonChanged } from 'src/engine/core-modules/event-emitter/utils/has-json-changed.util';

describe('hasJsonChanged', () => {
  describe('null/undefined handling', () => {
    it('should return false when both values are null', () => {
      expect(hasJsonChanged(null, null)).toBe(false);
    });

    it('should return false when both values are undefined', () => {
      expect(hasJsonChanged(undefined, undefined)).toBe(false);
    });

    it('should return true when old is null and new is defined', () => {
      expect(hasJsonChanged(null, { key: 'value' })).toBe(true);
    });

    it('should return true when old is undefined and new is defined', () => {
      expect(hasJsonChanged(undefined, { key: 'value' })).toBe(true);
    });

    it('should return true when old is defined and new is null', () => {
      expect(hasJsonChanged({ key: 'value' }, null)).toBe(true);
    });

    it('should return true when old is defined and new is undefined', () => {
      expect(hasJsonChanged({ key: 'value' }, undefined)).toBe(true);
    });
  });

  describe('identical objects', () => {
    it('should return false for same reference', () => {
      const obj = { key: 'value' };

      expect(hasJsonChanged(obj, obj)).toBe(false);
    });

    it('should return false for identical simple objects', () => {
      expect(hasJsonChanged({ key: 'value' }, { key: 'value' })).toBe(false);
    });

    it('should return false for identical nested objects', () => {
      const obj1 = { level1: { level2: { key: 'value' } } };
      const obj2 = { level1: { level2: { key: 'value' } } };

      expect(hasJsonChanged(obj1, obj2)).toBe(false);
    });

    it('should return false for identical arrays', () => {
      expect(hasJsonChanged([1, 2, 3], [1, 2, 3])).toBe(false);
    });
  });

  describe('different objects', () => {
    it('should return true for different simple values', () => {
      expect(hasJsonChanged({ key: 'value1' }, { key: 'value2' })).toBe(true);
    });

    it('should return true for different nested values', () => {
      const obj1 = { level1: { level2: { key: 'value1' } } };
      const obj2 = { level1: { level2: { key: 'value2' } } };

      expect(hasJsonChanged(obj1, obj2)).toBe(true);
    });

    it('should return true for different array lengths', () => {
      expect(hasJsonChanged([1, 2, 3], [1, 2])).toBe(true);
    });

    it('should return true for different array values', () => {
      expect(hasJsonChanged([1, 2, 3], [1, 2, 4])).toBe(true);
    });

    it('should return true for added keys', () => {
      expect(hasJsonChanged({ a: 1 }, { a: 1, b: 2 })).toBe(true);
    });

    it('should return true for removed keys', () => {
      expect(hasJsonChanged({ a: 1, b: 2 }, { a: 1 })).toBe(true);
    });
  });

  describe('large nested objects', () => {
    it('should handle large workflow-like structures', () => {
      const workflowState1 = {
        flow: {
          trigger: {
            name: 'trigger',
            type: 'DATABASE_EVENT',
            settings: { eventName: 'company.created', outputSchema: {} },
          },
          steps: Array.from({ length: 100 }, (_, i) => ({
            id: `step-${i}`,
            name: `Step ${i}`,
            type: 'CODE',
            settings: { code: `console.log(${i})` },
            valid: true,
          })),
        },
        stepInfos: {
          trigger: { status: 'SUCCESS', result: {} },
        },
      };

      const workflowState2 = {
        ...workflowState1,
        stepInfos: {
          ...workflowState1.stepInfos,
          'step-0': { status: 'SUCCESS', result: { value: 42 } },
        },
      };

      expect(hasJsonChanged(workflowState1, workflowState1)).toBe(false);
      expect(hasJsonChanged(workflowState1, workflowState2)).toBe(true);
    });
  });
});
