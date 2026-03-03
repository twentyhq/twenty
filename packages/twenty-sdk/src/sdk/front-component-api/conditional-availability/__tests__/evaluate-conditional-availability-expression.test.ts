import { toExprEval } from '@/cli/utilities/build/common/conditional-availability/to-expr-eval';
import { type CommandMenuContext } from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

const buildMockCommandMenuContext = (
  overrides: Partial<CommandMenuContext> = {},
): CommandMenuContext => ({
  isShowPage: false,
  isInRightDrawer: false,
  isFavorite: false,
  isRemote: false,
  isNoteOrTask: false,
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  numberOfSelectedRecords: 0,
  objectPermissions: {
    objectMetadataId: 'test-metadata-id',
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  selectedRecord: undefined,
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  ...overrides,
});

describe('end-to-end: native JS expression -> transform -> evaluate', () => {
  describe('single boolean variables', () => {
    it('should evaluate isShowPage when true', () => {
      const expression = toExprEval('isShowPage');
      const context = buildMockCommandMenuContext({ isShowPage: true });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate isShowPage when false', () => {
      const expression = toExprEval('isShowPage');
      const context = buildMockCommandMenuContext({ isShowPage: false });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate isFavorite', () => {
      const expression = toExprEval('isFavorite');
      const context = buildMockCommandMenuContext({ isFavorite: true });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate hasAnySoftDeleteFilterOnView', () => {
      const expression = toExprEval('hasAnySoftDeleteFilterOnView');
      const context = buildMockCommandMenuContext({
        hasAnySoftDeleteFilterOnView: true,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('nested dot-notation: objectPermissions', () => {
    it('should evaluate canUpdateObjectRecords when true', () => {
      const expression = toExprEval('objectPermissions.canUpdateObjectRecords');
      const context = buildMockCommandMenuContext();

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate canDestroyObjectRecords when false', () => {
      const expression = toExprEval(
        'objectPermissions.canDestroyObjectRecords',
      );
      const context = buildMockCommandMenuContext();

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });
  });

  describe('nested dot-notation: selectedRecord', () => {
    it('should evaluate selectedRecord.isRemote', () => {
      const expression = toExprEval('selectedRecord.isRemote');
      const context = buildMockCommandMenuContext({
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: null,
          isRemote: true,
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('comparison operators', () => {
    it('should evaluate numberOfSelectedRecords > 0 when records selected', () => {
      const expression = toExprEval('numberOfSelectedRecords > 0');
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 3,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate numberOfSelectedRecords > 0 when none selected', () => {
      const expression = toExprEval('numberOfSelectedRecords > 0');
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 0,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate strict equality via ===', () => {
      const expression = toExprEval('numberOfSelectedRecords === 1');
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 1,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate strict inequality via !==', () => {
      const expression = toExprEval('numberOfSelectedRecords !== 0');
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 5,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('feature flags', () => {
    it('should evaluate featureFlags.IS_AI_ENABLED when enabled', () => {
      const expression = toExprEval('featureFlags.IS_AI_ENABLED');
      const context = buildMockCommandMenuContext({
        featureFlags: { IS_AI_ENABLED: true },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate featureFlags.IS_AI_ENABLED when disabled', () => {
      const expression = toExprEval('featureFlags.IS_AI_ENABLED');
      const context = buildMockCommandMenuContext({
        featureFlags: { IS_AI_ENABLED: false },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });
  });

  describe('dynamic target object permissions', () => {
    it('should evaluate targetObjectReadPermissions.person', () => {
      const expression = toExprEval('targetObjectReadPermissions.person');
      const context = buildMockCommandMenuContext({
        targetObjectReadPermissions: { person: true, company: false },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate targetObjectWritePermissions.company', () => {
      const expression = toExprEval('targetObjectWritePermissions.company');
      const context = buildMockCommandMenuContext({
        targetObjectWritePermissions: { person: false, company: true },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('custom functions', () => {
    it('should evaluate isDefined on selectedRecord.deletedAt when null', () => {
      const expression = toExprEval('isDefined(selectedRecord.deletedAt)');
      const context = buildMockCommandMenuContext({
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: null,
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate isDefined on selectedRecord.deletedAt when set', () => {
      const expression = toExprEval('isDefined(selectedRecord.deletedAt)');
      const context = buildMockCommandMenuContext({
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: '2024-06-01',
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('logical combinations with && || !', () => {
    it('should evaluate "canUpdate && !isInRightDrawer"', () => {
      const expression = toExprEval(
        'objectPermissions.canUpdateObjectRecords && !isInRightDrawer',
      );
      const context = buildMockCommandMenuContext({
        isInRightDrawer: false,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate "canUpdate && !isInRightDrawer" when in right drawer', () => {
      const expression = toExprEval(
        'objectPermissions.canUpdateObjectRecords && !isInRightDrawer',
      );
      const context = buildMockCommandMenuContext({
        isInRightDrawer: true,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate "isShowPage || isFavorite"', () => {
      const expression = toExprEval('isShowPage || isFavorite');

      expect(
        evaluateConditionalAvailabilityExpression(
          expression,
          buildMockCommandMenuContext({
            isShowPage: false,
            isFavorite: true,
          }),
        ),
      ).toBe(true);

      expect(
        evaluateConditionalAvailabilityExpression(
          expression,
          buildMockCommandMenuContext({
            isShowPage: false,
            isFavorite: false,
          }),
        ),
      ).toBe(false);
    });
  });

  describe('complex real-world expressions', () => {
    it('should evaluate soft delete availability expression', () => {
      const expression = toExprEval(
        'objectPermissions.canSoftDeleteObjectRecords && !selectedRecord.isRemote && numberOfSelectedRecords > 0',
      );
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 2,
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: null,
          isRemote: false,
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should reject soft delete when record is remote', () => {
      const expression = toExprEval(
        'objectPermissions.canSoftDeleteObjectRecords && !selectedRecord.isRemote && numberOfSelectedRecords > 0',
      );
      const context = buildMockCommandMenuContext({
        numberOfSelectedRecords: 1,
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: null,
          isRemote: true,
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate feature flag gated with permissions', () => {
      const expression = toExprEval(
        'featureFlags.IS_AI_ENABLED && objectPermissions.canReadObjectRecords',
      );
      const context = buildMockCommandMenuContext({
        featureFlags: { IS_AI_ENABLED: true },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should reject feature flag gated expression when flag is off', () => {
      const expression = toExprEval(
        'featureFlags.IS_AI_ENABLED && objectPermissions.canReadObjectRecords',
      );
      const context = buildMockCommandMenuContext({
        featureFlags: { IS_AI_ENABLED: false },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(false);
    });

    it('should evaluate show page with write permission on target object', () => {
      const expression = toExprEval(
        'isShowPage && targetObjectWritePermissions.person',
      );
      const context = buildMockCommandMenuContext({
        isShowPage: true,
        targetObjectWritePermissions: { person: true },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate parenthesized or with and', () => {
      const expression = toExprEval('(isShowPage || isFavorite) && !isRemote');
      const context = buildMockCommandMenuContext({
        isShowPage: false,
        isFavorite: true,
        isRemote: false,
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });

    it('should evaluate string comparison with ===', () => {
      const expression = toExprEval(
        'isShowPage && selectedRecord.company.name === "apple"',
      );
      const context = buildMockCommandMenuContext({
        isShowPage: true,
        selectedRecord: {
          id: 'rec-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          deletedAt: null,
          company: { name: 'apple' },
        },
      });

      expect(
        evaluateConditionalAvailabilityExpression(expression, context),
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return true for null expression', () => {
      const context = buildMockCommandMenuContext();

      expect(evaluateConditionalAvailabilityExpression(null, context)).toBe(
        true,
      );
    });

    it('should return true for undefined expression', () => {
      const context = buildMockCommandMenuContext();

      expect(
        evaluateConditionalAvailabilityExpression(undefined, context),
      ).toBe(true);
    });

    it('should return true for empty string expression', () => {
      const context = buildMockCommandMenuContext();

      expect(evaluateConditionalAvailabilityExpression('', context)).toBe(true);
    });

    it('should return false for invalid expression', () => {
      const context = buildMockCommandMenuContext();

      expect(
        evaluateConditionalAvailabilityExpression(
          'this is not valid !!!',
          context,
        ),
      ).toBe(false);
    });
  });
});
