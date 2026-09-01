import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  type CoreWorkflowFilterRuleInput,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import { buildCoreWorkflowFilterPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const FIRST_PARAMETER_INDEX = 2;

const RELATIVE_DATE_FILTER_VALUE = JSON.stringify({
  direction: 'PAST',
  amount: 3,
  unit: 'DAY',
  timezone: 'UTC',
});

const buildPredicate = (
  rules: CoreWorkflowFilterRuleInput[],
  logicalOperator: CoreWorkflowFilterLogicalOperator = CoreWorkflowFilterLogicalOperator.AND,
) =>
  buildCoreWorkflowFilterPredicate({
    filter: { logicalOperator, rules },
    firstParameterIndex: FIRST_PARAMETER_INDEX,
  });

type VersionFlags = {
  hasDraftVersion: boolean;
  hasActiveVersion: boolean;
  hasDeactivatedVersion: boolean;
};

const ALL_VERSION_FLAG_COMBINATIONS: VersionFlags[] = [false, true].flatMap(
  (hasDraftVersion) =>
    [false, true].flatMap((hasActiveVersion) =>
      [false, true].map((hasDeactivatedVersion) => ({
        hasDraftVersion,
        hasActiveVersion,
        hasDeactivatedVersion,
      })),
    ),
);

// evaluates a generated status predicate against in-memory version flags by
// substituting the aggregate expressions with their boolean values
const evaluateStatusPredicate = (
  predicate: string,
  { hasDraftVersion, hasActiveVersion, hasDeactivatedVersion }: VersionFlags,
): boolean => {
  const booleanExpression = predicate
    .split(`coalesce(bool_or(v.status = 'DRAFT'), false)`)
    .join(String(hasDraftVersion))
    .split(`coalesce(bool_or(v.status = 'ACTIVE'), false)`)
    .join(String(hasActiveVersion))
    .split(`coalesce(bool_or(v.status = 'DEACTIVATED'), false)`)
    .join(String(hasDeactivatedVersion))
    .split('NOT')
    .join('!')
    .split('AND')
    .join('&&')
    .split('OR')
    .join('||');

  return new Function(`return ${booleanExpression};`)() as boolean;
};

describe('buildCoreWorkflowFilterPredicate', () => {
  it('should not filter when no filter is provided', () => {
    expect(
      buildCoreWorkflowFilterPredicate({ firstParameterIndex: 2 }),
    ).toEqual({ parameters: [] });

    expect(
      buildCoreWorkflowFilterPredicate({
        filter: null,
        firstParameterIndex: 2,
      }),
    ).toEqual({ parameters: [] });
  });

  it('should not filter when the rule list is empty', () => {
    expect(buildPredicate([])).toEqual({ parameters: [] });
  });

  describe('NAME rules', () => {
    it('should build a case-insensitive contains predicate', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: 'invoice',
          },
        ]),
      ).toEqual({
        predicate: `(c.name ILIKE $2 ESCAPE '\\')`,
        parameters: ['%invoice%'],
      });
    });

    it('should escape ILIKE wildcards in the bound pattern', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: '100%_off',
          },
        ]).parameters,
      ).toEqual(['%100\\%\\_off%']);
    });

    it('should let an unnamed workflow match a negative text predicate', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
            value: 'invoice',
          },
        ]),
      ).toEqual({
        predicate: `((c.name IS NULL OR c.name NOT ILIKE $2 ESCAPE '\\'))`,
        parameters: ['%invoice%'],
      });
    });

    it('should match the whole name without wildcards for IS', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.IS,
            value: '  Send invoice  ',
          },
        ]),
      ).toEqual({
        predicate: `(c.name ILIKE $2 ESCAPE '\\')`,
        parameters: ['Send invoice'],
      });
    });

    it('should build an IS NOT predicate', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.IS_NOT,
            value: 'Send invoice',
          },
        ]),
      ).toEqual({
        predicate: `((c.name IS NULL OR c.name NOT ILIKE $2 ESCAPE '\\'))`,
        parameters: ['Send invoice'],
      });
    });

    it('should treat a blank name as empty', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.IS_EMPTY,
          },
        ]),
      ).toEqual({
        predicate: `((c.name IS NULL OR c.name = ''))`,
        parameters: [],
      });

      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.NAME,
            operand: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
          },
        ]),
      ).toEqual({
        predicate: `((c.name IS NOT NULL AND c.name <> ''))`,
        parameters: [],
      });
    });

    it.each([
      CoreWorkflowFilterOperand.CONTAINS,
      CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
      CoreWorkflowFilterOperand.IS,
      CoreWorkflowFilterOperand.IS_NOT,
    ])('should reject %s without a value', (operand) => {
      expect(() =>
        buildPredicate([
          { fieldKey: CoreWorkflowFilterFieldKey.NAME, operand, value: '   ' },
        ]),
      ).toThrow(UserInputError);
    });
  });

  describe('STATUSES rules', () => {
    it('should build a predicate per selected status', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: JSON.stringify([
              WorkflowStatus.DRAFT,
              WorkflowStatus.ACTIVE,
            ]),
          },
        ]),
      ).toEqual({
        predicate: `((coalesce(bool_or(v.status = 'DRAFT'), false) OR coalesce(bool_or(v.status = 'ACTIVE'), false)))`,
        parameters: [],
      });
    });

    it('should accept a bare status alongside a JSON encoded array', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: 'ACTIVE',
          },
        ]).predicate,
      ).toBe(`((coalesce(bool_or(v.status = 'ACTIVE'), false)))`);
    });

    it('should negate the selected statuses for DOES NOT CONTAIN', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
            value: JSON.stringify([WorkflowStatus.ACTIVE]),
          },
        ]).predicate,
      ).toBe(`((NOT (coalesce(bool_or(v.status = 'ACTIVE'), false))))`);
    });

    it('should reject an unknown status', () => {
      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: JSON.stringify(['ARCHIVED']),
          },
        ]),
      ).toThrow(UserInputError);
    });

    it('should reject an empty status selection', () => {
      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: JSON.stringify([]),
          },
        ]),
      ).toThrow(UserInputError);
    });

    it.each([
      CoreWorkflowFilterOperand.CONTAINS,
      CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
      CoreWorkflowFilterOperand.IS_EMPTY,
      CoreWorkflowFilterOperand.IS_NOT_EMPTY,
    ])(
      'should match exactly the workflows computeCoreWorkflowStatuses derives for %s',
      (operand) => {
        const selectedStatuses = [
          WorkflowStatus.ACTIVE,
          WorkflowStatus.DEACTIVATED,
        ];
        const { predicate } = buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand,
            value: JSON.stringify(selectedStatuses),
          },
        ]);

        for (const versionFlags of ALL_VERSION_FLAG_COMBINATIONS) {
          const derivedStatuses: string[] =
            computeCoreWorkflowStatuses(versionFlags);
          const matchesSelection = selectedStatuses.some((status) =>
            derivedStatuses.includes(status),
          );
          const expectedMatchByOperand: Partial<
            Record<CoreWorkflowFilterOperand, boolean>
          > = {
            [CoreWorkflowFilterOperand.CONTAINS]: matchesSelection,
            [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: !matchesSelection,
            [CoreWorkflowFilterOperand.IS_EMPTY]: derivedStatuses.length === 0,
            [CoreWorkflowFilterOperand.IS_NOT_EMPTY]:
              derivedStatuses.length > 0,
          };
          const expectedMatch = expectedMatchByOperand[operand];

          expect(evaluateStatusPredicate(predicate ?? '', versionFlags)).toBe(
            expectedMatch,
          );
        }
      },
    );
  });

  describe('UPDATED_AT rules', () => {
    it('should bind UTC day bounds for IS when no timezone travels with the rule', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS,
            value: JSON.stringify('2026-08-31T13:45:00.000Z'),
          },
        ]),
      ).toEqual({
        predicate: `((c."updatedAt" >= $2::timestamptz AND c."updatedAt" < $3::timestamptz))`,
        parameters: ['2026-08-31T00:00:00Z', '2026-09-01T00:00:00Z'],
      });
    });

    it('should bind the day bounds of the rule timezone for IS', () => {
      // 2026-08-31T23:30Z is already Sept 1 in Tokyo
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS,
            value: JSON.stringify('2026-08-31T23:30:00.000Z'),
            timezone: 'Asia/Tokyo',
          },
        ]),
      ).toEqual({
        predicate: `((c."updatedAt" >= $2::timestamptz AND c."updatedAt" < $3::timestamptz))`,
        parameters: ['2026-08-31T15:00:00Z', '2026-09-01T15:00:00Z'],
      });
    });

    it('should accept a bare ISO string alongside a JSON encoded one', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_BEFORE,
            value: '2026-08-31T13:45:00.000Z',
          },
        ]),
      ).toEqual({
        predicate: `(c."updatedAt" < $2::timestamptz)`,
        parameters: ['2026-08-31T13:45:00.000Z'],
      });
    });

    it('should build an IS AFTER predicate', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_AFTER,
            value: JSON.stringify('2026-08-31T13:45:00.000Z'),
          },
        ]),
      ).toEqual({
        predicate: `(c."updatedAt" >= $2::timestamptz)`,
        parameters: ['2026-08-31T13:45:00.000Z'],
      });
    });

    it('should build emptiness predicates', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_EMPTY,
          },
        ]),
      ).toEqual({
        predicate: `(c."updatedAt" IS NULL)`,
        parameters: [],
      });

      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
          },
        ]),
      ).toEqual({
        predicate: `(c."updatedAt" IS NOT NULL)`,
        parameters: [],
      });
    });

    it('should compare against now for the operands that take now as reference', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_IN_PAST,
          },
        ]),
      ).toEqual({ predicate: `(c."updatedAt" < now())`, parameters: [] });

      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_IN_FUTURE,
          },
        ]),
      ).toEqual({ predicate: `(c."updatedAt" > now())`, parameters: [] });

      const todayPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_TODAY,
          timezone: 'Asia/Tokyo',
        },
      ]);

      expect(todayPredicate.predicate).toBe(
        `((c."updatedAt" >= $2::timestamptz AND c."updatedAt" < $3::timestamptz))`,
      );

      const [todayStart, tomorrowStart] = todayPredicate.parameters as string[];
      const dayInMilliseconds = 24 * 60 * 60 * 1000;

      expect(
        new Date(tomorrowStart).getTime() - new Date(todayStart).getTime(),
      ).toBe(dayInMilliseconds);
      expect(new Date(todayStart).getTime()).toBeLessThanOrEqual(Date.now());
      expect(new Date(tomorrowStart).getTime()).toBeGreaterThan(Date.now());
    });

    it('should resolve a relative date filter into a bound range', () => {
      const { predicate, parameters } = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_RELATIVE,
          value: RELATIVE_DATE_FILTER_VALUE,
        },
      ]);

      expect(predicate).toBe(
        `((c."updatedAt" >= $2::timestamptz AND c."updatedAt" < $3::timestamptz))`,
      );

      const [start, end] = parameters as [string, string];

      expect(new Date(end).getTime() - new Date(start).getTime()).toBe(
        3 * 24 * 60 * 60 * 1000,
      );
    });

    it('should reject a relative date filter value that cannot be parsed', () => {
      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_RELATIVE,
            value: JSON.stringify({ direction: 'SOMEDAY', unit: 'DAY' }),
          },
        ]),
      ).toThrow(UserInputError);
    });

    it('should reject a value that is not a date', () => {
      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_AFTER,
            value: 'not a date',
          },
        ]),
      ).toThrow(UserInputError);
    });
  });

  describe('supported operands', () => {
    const VALUE_BY_FIELD_KEY: Record<CoreWorkflowFilterFieldKey, string> = {
      [CoreWorkflowFilterFieldKey.NAME]: 'invoice',
      [CoreWorkflowFilterFieldKey.STATUSES]: JSON.stringify([
        WorkflowStatus.ACTIVE,
      ]),
      [CoreWorkflowFilterFieldKey.UPDATED_AT]: JSON.stringify(
        '2026-08-31T13:45:00.000Z',
      ),
    };

    const SUPPORTED_OPERANDS_BY_FIELD_KEY: Record<
      CoreWorkflowFilterFieldKey,
      CoreWorkflowFilterOperand[]
    > = {
      [CoreWorkflowFilterFieldKey.NAME]: [
        CoreWorkflowFilterOperand.CONTAINS,
        CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
        CoreWorkflowFilterOperand.IS,
        CoreWorkflowFilterOperand.IS_NOT,
        CoreWorkflowFilterOperand.IS_EMPTY,
        CoreWorkflowFilterOperand.IS_NOT_EMPTY,
      ],
      [CoreWorkflowFilterFieldKey.STATUSES]: [
        CoreWorkflowFilterOperand.CONTAINS,
        CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
        CoreWorkflowFilterOperand.IS_EMPTY,
        CoreWorkflowFilterOperand.IS_NOT_EMPTY,
      ],
      [CoreWorkflowFilterFieldKey.UPDATED_AT]: [
        CoreWorkflowFilterOperand.IS,
        CoreWorkflowFilterOperand.IS_BEFORE,
        CoreWorkflowFilterOperand.IS_AFTER,
        CoreWorkflowFilterOperand.IS_IN_PAST,
        CoreWorkflowFilterOperand.IS_IN_FUTURE,
        CoreWorkflowFilterOperand.IS_TODAY,
        CoreWorkflowFilterOperand.IS_RELATIVE,
        CoreWorkflowFilterOperand.IS_EMPTY,
        CoreWorkflowFilterOperand.IS_NOT_EMPTY,
      ],
    };

    const fieldOperandPairs = Object.values(CoreWorkflowFilterFieldKey).flatMap(
      (fieldKey) =>
        Object.values(CoreWorkflowFilterOperand).map(
          (operand) => [fieldKey, operand] as const,
        ),
    );

    it.each(fieldOperandPairs)(
      'should accept %s only with the operands its type allows (%s)',
      (fieldKey, operand) => {
        const value =
          operand === CoreWorkflowFilterOperand.IS_RELATIVE
            ? RELATIVE_DATE_FILTER_VALUE
            : VALUE_BY_FIELD_KEY[fieldKey];
        const build = () => buildPredicate([{ fieldKey, operand, value }]);

        if (SUPPORTED_OPERANDS_BY_FIELD_KEY[fieldKey].includes(operand)) {
          expect(build().predicate).toEqual(expect.any(String));

          return;
        }

        expect(build).toThrow(UserInputError);
      },
    );
  });

  describe('rule composition', () => {
    const nameRule: CoreWorkflowFilterRuleInput = {
      fieldKey: CoreWorkflowFilterFieldKey.NAME,
      operand: CoreWorkflowFilterOperand.CONTAINS,
      value: 'invoice',
    };
    const statusRule: CoreWorkflowFilterRuleInput = {
      fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
      operand: CoreWorkflowFilterOperand.CONTAINS,
      value: JSON.stringify([WorkflowStatus.ACTIVE]),
    };

    it('should join rules with AND', () => {
      expect(
        buildPredicate(
          [nameRule, statusRule],
          CoreWorkflowFilterLogicalOperator.AND,
        ),
      ).toEqual({
        predicate: `(c.name ILIKE $2 ESCAPE '\\' AND (coalesce(bool_or(v.status = 'ACTIVE'), false)))`,
        parameters: ['%invoice%'],
      });
    });

    // a row-level rule and an aggregated status rule cannot be split into a
    // WHERE and a HAVING clause under OR, so both land in the same expression
    it('should join a row level rule and a status rule with OR', () => {
      expect(
        buildPredicate(
          [nameRule, statusRule],
          CoreWorkflowFilterLogicalOperator.OR,
        ),
      ).toEqual({
        predicate: `(c.name ILIKE $2 ESCAPE '\\' OR (coalesce(bool_or(v.status = 'ACTIVE'), false)))`,
        parameters: ['%invoice%'],
      });
    });

    it('should number bound parameters from the given index across rules', () => {
      expect(
        buildCoreWorkflowFilterPredicate({
          filter: {
            logicalOperator: CoreWorkflowFilterLogicalOperator.OR,
            rules: [
              nameRule,
              {
                fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
                operand: CoreWorkflowFilterOperand.IS,
                value: JSON.stringify('2026-08-31T13:45:00.000Z'),
              },
              statusRule,
              {
                fieldKey: CoreWorkflowFilterFieldKey.NAME,
                operand: CoreWorkflowFilterOperand.IS_NOT,
                value: 'Draft',
              },
            ],
          },
          firstParameterIndex: 5,
        }),
      ).toEqual({
        predicate: `(c.name ILIKE $5 ESCAPE '\\' OR (c."updatedAt" >= $6::timestamptz AND c."updatedAt" < $7::timestamptz) OR (coalesce(bool_or(v.status = 'ACTIVE'), false)) OR (c.name IS NULL OR c.name NOT ILIKE $8 ESCAPE '\\'))`,
        parameters: [
          '%invoice%',
          '2026-08-31T00:00:00Z',
          '2026-09-01T00:00:00Z',
          'Draft',
        ],
      });
    });
  });
});
