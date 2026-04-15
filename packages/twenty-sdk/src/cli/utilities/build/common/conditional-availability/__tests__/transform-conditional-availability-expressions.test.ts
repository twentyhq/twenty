import * as fs from 'fs';
import * as path from 'path';

import { transformConditionalAvailabilityExpressionsForEsBuildPlugin } from '@/cli/utilities/build/common/conditional-availability/utils/transform-conditional-availability-expressions';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

const MOCKS_DIR = path.join(__dirname, '__mocks__');

const readMock = (filename: string): string =>
  fs.readFileSync(path.join(MOCKS_DIR, filename), 'utf8');

const buildMockCommandMenuContextApi = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  pageType: ContextStorePageType.Index,
  isInSidePanel: false,
  isPageInEditMode: false,
  favoriteRecordIds: [],
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
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {},
  objectMetadataLabel: '',
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
        'const a = { conditionalAvailabilityExpression: pageType === "RECORD_PAGE" };',
        'const b = { conditionalAvailabilityExpression: favoriteRecordIds.length > 0 && !objectMetadataItem.isRemote };',
      ].join('\n');
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toContain(
        'conditionalAvailabilityExpression: "pageType == \\"RECORD_PAGE\\""',
      );
      expect(transformed).toContain(
        'conditionalAvailabilityExpression: "arrayLength(favoriteRecordIds) > 0 and not objectMetadataItem.isRemote"',
      );
    });

    it('should handle extra spaces around colon', () => {
      const source =
        '{ conditionalAvailabilityExpression  :  pageType === "RECORD_PAGE" && favoriteRecordIds.length > 0 }';
      const transformed =
        transformConditionalAvailabilityExpressionsForEsBuildPlugin(source);

      expect(transformed).toContain(
        '"pageType == \\"RECORD_PAGE\\" and arrayLength(favoriteRecordIds) > 0"',
      );
    });
  });

  describe('e2e: mock file -> transform -> evaluate', () => {
    describe('simple-boolean-front-component', () => {
      it('should evaluate pageType when RECORD_PAGE', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Record,
        });

        expect(
          transformMockAndEvaluate(
            'simple-boolean-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should evaluate pageType when INDEX_PAGE', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Index,
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
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: null,
              isRemote: false,
            },
          ],
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
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: null,
              isRemote: true,
            },
          ],
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
          pageType: ContextStorePageType.Index,
          favoriteRecordIds: ['rec-1'],
          objectMetadataItem: { isRemote: false },
        });

        expect(
          transformMockAndEvaluate(
            'parenthesized-expression-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when remote even if record page', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Record,
          favoriteRecordIds: [],
          objectMetadataItem: { isRemote: true },
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
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: null,
            },
          ],
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
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: '2024-06-01',
            },
          ],
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
      it('should match when on record page and company name matches', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Record,
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: null,
              company: { name: 'apple' },
            },
          ],
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
          pageType: ContextStorePageType.Record,
          selectedRecords: [
            {
              id: 'rec-1',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              deletedAt: null,
              company: { name: 'google' },
            },
          ],
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
      it('should allow when on record page with write permission', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Record,
          targetObjectWritePermissions: { person: true },
        });

        expect(
          transformMockAndEvaluate(
            'target-permissions-front-component.ts',
            context,
          ),
        ).toBe(true);
      });

      it('should deny when not on record page', () => {
        const context = buildMockCommandMenuContextApi({
          pageType: ContextStorePageType.Index,
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
