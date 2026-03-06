import * as fs from 'fs';
import * as path from 'path';

import { transformConditionalAvailabilityExpressionsForEsBuildPlugin } from '@/cli/utilities/build/common/conditional-availability/utils/transform-conditional-availability-expressions';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

const MOCKS_DIR = path.join(__dirname, '__mocks__');

const readMock = (filename: string): string =>
  fs.readFileSync(path.join(MOCKS_DIR, filename), 'utf8');

const buildMockCommandMenuContextApi = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  isShowPage: false,
  isInSidePanel: false,
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

const CONDITIONAL_AVAILABILITY_EXPRESSION_REGEX =
  /conditionalAvailabilityExpression\s*:\s*("(?:[^"\\]|\\.)*")/;

const extractConditionalAvailabilityExpressionFromTransformedSource = (
  transformedSource: string,
): string | undefined => {
  const match = transformedSource.match(
    CONDITIONAL_AVAILABILITY_EXPRESSION_REGEX,
  );

  if (!match?.[1]) {
    return undefined;
  }

  return JSON.parse(match[1]) as string;
};

const transformMockAndEvaluate = (
  filename: string,
  context: CommandMenuContextApi,
): boolean => {
  const source = readMock(filename);

  const transformedSourceForEsBuildPlugin =
    transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

  const conditionalAvailabilityExpression =
    extractConditionalAvailabilityExpressionFromTransformedSource(
      transformedSourceForEsBuildPlugin,
    );

  return evaluateConditionalAvailabilityExpression(
    conditionalAvailabilityExpression,
    context,
  );
};

describe('transformConditionalAvailabilityExpressionsForEsBuildPlugin', () => {
  describe('transform correctness', () => {
    it('should convert && to and', () => {
      const source = '{ conditionalAvailabilityExpression: a && b }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe('{ conditionalAvailabilityExpression: "a and b"}');
    });

    it('should convert || to or', () => {
      const source = '{ conditionalAvailabilityExpression: a || b }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe('{ conditionalAvailabilityExpression: "a or b"}');
    });

    it('should convert ! to not', () => {
      const source = '{ conditionalAvailabilityExpression: !a }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe('{ conditionalAvailabilityExpression: "not a"}');
    });

    it('should convert === to ==', () => {
      const source = '{ conditionalAvailabilityExpression: a === 1 }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe('{ conditionalAvailabilityExpression: "a == 1"}');
    });

    it('should convert !== to !=', () => {
      const source = '{ conditionalAvailabilityExpression: a !== 0 }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe('{ conditionalAvailabilityExpression: "a != 0"}');
    });

    it('should convert all operators in a complex expression', () => {
      const source =
        '{ conditionalAvailabilityExpression: a && !b || c === 1 && d !== 0 }';
      const result =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(result).toBe(
        '{ conditionalAvailabilityExpression: "a and not b or c == 1 and d != 0"}',
      );
    });
  });

  describe('regex edge cases', () => {
    it('should skip already-quoted string expressions without leading space', () => {
      const source = '{ conditionalAvailabilityExpression:"already quoted" }';
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toBe(source);
    });

    it('should skip single-quoted string expressions without leading space', () => {
      const source = "{ conditionalAvailabilityExpression:'already quoted' }";
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toBe(source);
    });

    it('should skip template literal expressions without leading space', () => {
      const source = '{ conditionalAvailabilityExpression:`already quoted` }';
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toBe(source);
    });

    it('should handle multiple expressions in one source', () => {
      const source = [
        'const a = { conditionalAvailabilityExpression: isShowPage };',
        'const b = { conditionalAvailabilityExpression: isFavorite && !isRemote };',
      ].join('\n');
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toContain(
        'conditionalAvailabilityExpression: "isShowPage"',
      );
      expect(transformed).toContain(
        'conditionalAvailabilityExpression: "isFavorite and not isRemote"',
      );
    });

    it('should handle extra spaces around colon', () => {
      const source =
        '{ conditionalAvailabilityExpression  :  isShowPage && isFavorite }';
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toContain('"isShowPage and isFavorite"');
    });
  });

  describe('e2e: mock file -> transform -> evaluate', () => {
    describe('simple-boolean-front-component', () => {
      it('should evaluate isShowPage when true', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: true,
        });

        expect(
          transformMockAndEvaluate(
            'simple-boolean-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should evaluate isShowPage when false', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: false,
        });

        expect(
          transformMockAndEvaluate(
            'simple-boolean-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('permissions-check-front-component', () => {
      it('should allow when has permission and not in side panel', () => {
        const context = buildMockCommandMenuContextApi({
          isInSidePanel: false,
        });

        expect(
          transformMockAndEvaluate(
            'permissions-check-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when in side panel', () => {
        const context = buildMockCommandMenuContextApi({
          isInSidePanel: true,
        });

        expect(
          transformMockAndEvaluate(
            'permissions-check-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('comparison-operator-front-component', () => {
      it('should allow when records are selected', () => {
        const context = buildMockCommandMenuContextApi({
          numberOfSelectedRecords: 3,
        });

        expect(
          transformMockAndEvaluate(
            'comparison-operator-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when no records are selected', () => {
        const context = buildMockCommandMenuContextApi({
          numberOfSelectedRecords: 0,
        });

        expect(
          transformMockAndEvaluate(
            'comparison-operator-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('feature-flag-gated-front-component', () => {
      it('should allow when feature flag is enabled', () => {
        const context = buildMockCommandMenuContextApi({
          featureFlags: { IS_AI_ENABLED: true },
        });

        expect(
          transformMockAndEvaluate(
            'feature-flag-gated-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when feature flag is disabled', () => {
        const context = buildMockCommandMenuContextApi({
          featureFlags: { IS_AI_ENABLED: false },
        });

        expect(
          transformMockAndEvaluate(
            'feature-flag-gated-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('complex-soft-delete-front-component', () => {
      it('should allow soft delete for local record with selection', () => {
        const context = buildMockCommandMenuContextApi({
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
          transformMockAndEvaluate(
            'complex-soft-delete-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny soft delete when record is remote', () => {
        const context = buildMockCommandMenuContextApi({
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
          transformMockAndEvaluate(
            'complex-soft-delete-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('parenthesized-expression-front-component', () => {
      it('should allow when favorite and not remote', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: false,
          isFavorite: true,
          isRemote: false,
        });

        expect(
          transformMockAndEvaluate(
            'parenthesized-expression-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when remote even if show page', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: true,
          isFavorite: false,
          isRemote: true,
        });

        expect(
          transformMockAndEvaluate(
            'parenthesized-expression-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('custom-function-front-component', () => {
      it('should return false when deletedAt is null', () => {
        const context = buildMockCommandMenuContextApi({
          selectedRecord: {
            id: 'rec-1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            deletedAt: null,
          },
        });

        expect(
          transformMockAndEvaluate(
            'custom-function-front-component.ts',
            context,
          ),
        ).toBe(false);
      });

      it('should return true when deletedAt is set', () => {
        const context = buildMockCommandMenuContextApi({
          selectedRecord: {
            id: 'rec-1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            deletedAt: '2024-06-01',
          },
        });

        expect(
          transformMockAndEvaluate(
            'custom-function-front-component.ts',
            context,
          ),
        ).toBe(true);
      });
    });

    describe('string-comparison-front-component', () => {
      it('should match when on show page and company name matches', () => {
        const context = buildMockCommandMenuContextApi({
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
          transformMockAndEvaluate(
            'string-comparison-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should not match when company name differs', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: true,
          selectedRecord: {
            id: 'rec-1',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            deletedAt: null,
            company: { name: 'google' },
          },
        });

        expect(
          transformMockAndEvaluate(
            'string-comparison-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });

    describe('target-permissions-front-component', () => {
      it('should allow when on show page with write permission', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: true,
          targetObjectWritePermissions: { person: true },
        });

        expect(
          transformMockAndEvaluate(
            'target-permissions-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when not on show page', () => {
        const context = buildMockCommandMenuContextApi({
          isShowPage: false,
          targetObjectWritePermissions: { person: true },
        });

        expect(
          transformMockAndEvaluate(
            'target-permissions-front-component.ts',
            context,
          ),
        ).toBe(false);
      });
    });
  });
});
