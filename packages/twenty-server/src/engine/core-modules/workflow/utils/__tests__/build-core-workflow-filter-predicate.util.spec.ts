import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CoreWorkflowFilterFieldKey,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  type CoreWorkflowFilterRuleInput,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import {
  buildCoreWorkflowFilterPredicate,
  type CoreWorkflowFilterCandidate,
} from 'src/engine/core-modules/workflow/utils/build-core-workflow-filter-predicate.util';
import { computeCoreWorkflowStatuses } from 'src/engine/core-modules/workflow/utils/compute-core-workflow-statuses.util';

const RELATIVE_DATE_FILTER_VALUE = JSON.stringify({
  direction: 'PAST',
  amount: 3,
  unit: 'DAY',
  timezone: 'UTC',
});

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const buildCandidate = (
  overrides: Partial<CoreWorkflowFilterCandidate> = {},
): CoreWorkflowFilterCandidate => ({
  name: 'Send invoice',
  updatedAt: '2026-08-31T13:45:00.000Z',
  isSystem: false,
  statuses: [],
  ...overrides,
});

const buildPredicate = (
  rules: CoreWorkflowFilterRuleInput[],
  logicalOperator: CoreWorkflowFilterLogicalOperator = CoreWorkflowFilterLogicalOperator.AND,
) => buildCoreWorkflowFilterPredicate({ logicalOperator, rules });

const ALL_VERSION_FLAG_COMBINATIONS = [false, true].flatMap((hasDraftVersion) =>
  [false, true].flatMap((hasActiveVersion) =>
    [false, true].map((hasDeactivatedVersion) => ({
      hasDraftVersion,
      hasActiveVersion,
      hasDeactivatedVersion,
    })),
  ),
);

describe('buildCoreWorkflowFilterPredicate', () => {
  it('should match every workflow when no filter is provided', () => {
    expect(buildCoreWorkflowFilterPredicate(undefined)(buildCandidate())).toBe(
      true,
    );
    expect(buildCoreWorkflowFilterPredicate(null)(buildCandidate())).toBe(true);
    expect(buildPredicate([])(buildCandidate())).toBe(true);
  });

  describe('NAME rules', () => {
    it('should match names containing the value regardless of case', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.CONTAINS,
          value: ' INVOICE ',
        },
      ]);

      expect(predicate(buildCandidate({ name: 'Send invoice' }))).toBe(true);
      expect(predicate(buildCandidate({ name: 'Send quote' }))).toBe(false);
      expect(predicate(buildCandidate({ name: null }))).toBe(false);
    });

    it('should treat wildcard characters literally', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.CONTAINS,
          value: '100%_off',
        },
      ]);

      expect(predicate(buildCandidate({ name: 'Promo 100%_off' }))).toBe(true);
      expect(predicate(buildCandidate({ name: 'Promo 100 percent off' }))).toBe(
        false,
      );
    });

    it('should let an unnamed workflow match a negative text predicate', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.DOES_NOT_CONTAIN,
          value: 'invoice',
        },
      ]);

      expect(predicate(buildCandidate({ name: null }))).toBe(true);
      expect(predicate(buildCandidate({ name: 'Send quote' }))).toBe(true);
      expect(predicate(buildCandidate({ name: 'Send Invoice' }))).toBe(false);
    });

    it('should compare names exactly for IS and IS_NOT', () => {
      const isPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.IS,
          value: ' Send invoice ',
        },
      ]);
      const isNotPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.IS_NOT,
          value: 'Send invoice',
        },
      ]);

      expect(isPredicate(buildCandidate({ name: ' Send invoice ' }))).toBe(
        true,
      );
      expect(isPredicate(buildCandidate({ name: 'Send invoice' }))).toBe(false);
      expect(isNotPredicate(buildCandidate({ name: 'send invoice' }))).toBe(
        true,
      );
      expect(isNotPredicate(buildCandidate({ name: null }))).toBe(true);
      expect(isNotPredicate(buildCandidate({ name: 'Send invoice' }))).toBe(
        false,
      );
    });

    it('should treat a blank name as empty', () => {
      const isEmptyPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.IS_EMPTY,
        },
      ]);
      const isNotEmptyPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.NAME,
          operand: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
        },
      ]);

      expect(isEmptyPredicate(buildCandidate({ name: null }))).toBe(true);
      expect(isEmptyPredicate(buildCandidate({ name: '' }))).toBe(true);
      expect(isEmptyPredicate(buildCandidate())).toBe(false);
      expect(isNotEmptyPredicate(buildCandidate({ name: '' }))).toBe(false);
      expect(isNotEmptyPredicate(buildCandidate())).toBe(true);
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
    it('should match a workflow carrying any selected status', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
          operand: CoreWorkflowFilterOperand.CONTAINS,
          value: JSON.stringify([WorkflowStatus.DRAFT, WorkflowStatus.ACTIVE]),
        },
      ]);

      expect(
        predicate(buildCandidate({ statuses: [WorkflowStatus.ACTIVE] })),
      ).toBe(true);
      expect(
        predicate(buildCandidate({ statuses: [WorkflowStatus.DEACTIVATED] })),
      ).toBe(false);
    });

    it('should accept a bare status but reject a JSON encoded scalar', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
          operand: CoreWorkflowFilterOperand.CONTAINS,
          value: 'ACTIVE',
        },
      ]);

      expect(
        predicate(buildCandidate({ statuses: [WorkflowStatus.ACTIVE] })),
      ).toBe(true);

      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand: CoreWorkflowFilterOperand.CONTAINS,
            value: JSON.stringify('ACTIVE'),
          },
        ]),
      ).toThrow(UserInputError);
    });

    it.each([JSON.stringify(['ARCHIVED']), JSON.stringify([])])(
      'should reject the status selection %s',
      (value) => {
        expect(() =>
          buildPredicate([
            {
              fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
              operand: CoreWorkflowFilterOperand.CONTAINS,
              value,
            },
          ]),
        ).toThrow(UserInputError);
      },
    );

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
        const predicate = buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.STATUSES,
            operand,
            value: JSON.stringify(selectedStatuses),
          },
        ]);

        for (const versionFlags of ALL_VERSION_FLAG_COMBINATIONS) {
          const statuses = computeCoreWorkflowStatuses(versionFlags);
          const matchesSelection = selectedStatuses.some((status) =>
            statuses.includes(status),
          );
          const expectedMatchByOperand: Partial<
            Record<CoreWorkflowFilterOperand, boolean>
          > = {
            [CoreWorkflowFilterOperand.CONTAINS]: matchesSelection,
            [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: !matchesSelection,
            [CoreWorkflowFilterOperand.IS_EMPTY]: statuses.length === 0,
            [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: statuses.length > 0,
          };

          expect(predicate(buildCandidate({ statuses }))).toBe(
            expectedMatchByOperand[operand],
          );
        }
      },
    );
  });

  describe('UPDATED_AT rules', () => {
    it('should match the UTC day for IS when no timezone travels with the rule', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS,
          value: JSON.stringify('2026-08-31T13:45:00.000Z'),
        },
      ]);

      expect(
        predicate(buildCandidate({ updatedAt: '2026-08-31T00:00:00.000Z' })),
      ).toBe(true);
      expect(
        predicate(buildCandidate({ updatedAt: '2026-08-31T23:59:59.999Z' })),
      ).toBe(true);
      expect(
        predicate(buildCandidate({ updatedAt: '2026-09-01T00:00:00.000Z' })),
      ).toBe(false);
    });

    it('should match the day of the rule timezone for IS', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS,
          value: JSON.stringify('2026-08-31T23:30:00.000Z'),
          timezone: 'Asia/Tokyo',
        },
      ]);

      expect(
        predicate(buildCandidate({ updatedAt: '2026-08-31T15:00:00.000Z' })),
      ).toBe(true);
      expect(
        predicate(buildCandidate({ updatedAt: '2026-08-31T14:59:59.999Z' })),
      ).toBe(false);
      expect(
        predicate(buildCandidate({ updatedAt: '2026-09-01T15:00:00.000Z' })),
      ).toBe(false);
    });

    it('should compare against the given instant for IS_BEFORE and IS_AFTER', () => {
      const isBeforePredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_BEFORE,
          value: '2026-08-31T13:45:00.000Z',
        },
      ]);
      const isAfterPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_AFTER,
          value: JSON.stringify('2026-08-31T13:45:00.000Z'),
        },
      ]);
      const atInstant = buildCandidate({
        updatedAt: '2026-08-31T13:45:00.000Z',
      });
      const beforeInstant = buildCandidate({
        updatedAt: '2026-08-31T13:44:59.999Z',
      });

      expect(isBeforePredicate(beforeInstant)).toBe(true);
      expect(isBeforePredicate(atInstant)).toBe(false);
      expect(isAfterPredicate(atInstant)).toBe(true);
      expect(isAfterPredicate(beforeInstant)).toBe(false);
    });

    it('should treat updatedAt as never empty', () => {
      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_EMPTY,
          },
        ])(buildCandidate()),
      ).toBe(false);

      expect(
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
            operand: CoreWorkflowFilterOperand.IS_NOT_EMPTY,
          },
        ])(buildCandidate()),
      ).toBe(true);
    });

    it('should compare against now for the operands that take now as reference', () => {
      const past = buildCandidate({
        updatedAt: new Date(Date.now() - DAY_IN_MILLISECONDS * 2).toISOString(),
      });
      const future = buildCandidate({
        updatedAt: new Date(Date.now() + DAY_IN_MILLISECONDS * 2).toISOString(),
      });
      const now = buildCandidate({ updatedAt: new Date().toISOString() });

      const isInPastPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_IN_PAST,
        },
      ]);
      const isInFuturePredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_IN_FUTURE,
        },
      ]);
      const isTodayPredicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_TODAY,
          timezone: 'Asia/Tokyo',
        },
      ]);

      expect(isInPastPredicate(past)).toBe(true);
      expect(isInPastPredicate(future)).toBe(false);
      expect(isInFuturePredicate(future)).toBe(true);
      expect(isInFuturePredicate(past)).toBe(false);
      expect(isTodayPredicate(now)).toBe(true);
      expect(isTodayPredicate(past)).toBe(false);
      expect(isTodayPredicate(future)).toBe(false);
    });

    it('should resolve a relative date filter into a range', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_RELATIVE,
          value: RELATIVE_DATE_FILTER_VALUE,
        },
      ]);

      expect(
        predicate(
          buildCandidate({
            updatedAt: new Date(Date.now() - DAY_IN_MILLISECONDS).toISOString(),
          }),
        ),
      ).toBe(true);
      expect(
        predicate(
          buildCandidate({
            updatedAt: new Date(
              Date.now() - DAY_IN_MILLISECONDS * 5,
            ).toISOString(),
          }),
        ),
      ).toBe(false);
    });

    it('should fall back to the rule timezone when the relative value carries none', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT,
          operand: CoreWorkflowFilterOperand.IS_RELATIVE,
          value: JSON.stringify({ direction: 'THIS', unit: 'DAY' }),
          timezone: 'Asia/Tokyo',
        },
      ]);

      expect(
        predicate(buildCandidate({ updatedAt: new Date().toISOString() })),
      ).toBe(true);
    });

    it.each([
      {
        operand: CoreWorkflowFilterOperand.IS_RELATIVE,
        value: JSON.stringify({
          direction: 'PAST',
          amount: 1,
          unit: 'DAY',
          timezone: 'Not/AZone',
        }),
      },
      {
        operand: CoreWorkflowFilterOperand.IS_RELATIVE,
        value: JSON.stringify({ direction: 'SOMEDAY', unit: 'DAY' }),
      },
      { operand: CoreWorkflowFilterOperand.IS_AFTER, value: 'not a date' },
    ])('should reject the $operand value $value', ({ operand, value }) => {
      expect(() =>
        buildPredicate([
          { fieldKey: CoreWorkflowFilterFieldKey.UPDATED_AT, operand, value },
        ]),
      ).toThrow(UserInputError);
    });
  });

  describe('IS_SYSTEM rules', () => {
    it('should match the requested system flag', () => {
      const predicate = buildPredicate([
        {
          fieldKey: CoreWorkflowFilterFieldKey.IS_SYSTEM,
          operand: CoreWorkflowFilterOperand.IS,
          value: 'false',
        },
      ]);

      expect(predicate(buildCandidate({ isSystem: false }))).toBe(true);
      expect(predicate(buildCandidate({ isSystem: true }))).toBe(false);
    });

    it('should reject a value that is not a boolean', () => {
      expect(() =>
        buildPredicate([
          {
            fieldKey: CoreWorkflowFilterFieldKey.IS_SYSTEM,
            operand: CoreWorkflowFilterOperand.IS,
            value: 'maybe',
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
      [CoreWorkflowFilterFieldKey.IS_SYSTEM]: 'false',
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
      [CoreWorkflowFilterFieldKey.IS_SYSTEM]: [CoreWorkflowFilterOperand.IS],
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
          expect(build()).toEqual(expect.any(Function));

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
    const activeInvoice = buildCandidate({
      name: 'Send invoice',
      statuses: [WorkflowStatus.ACTIVE],
    });
    const draftInvoice = buildCandidate({
      name: 'Send invoice',
      statuses: [WorkflowStatus.DRAFT],
    });
    const activeQuote = buildCandidate({
      name: 'Send quote',
      statuses: [WorkflowStatus.ACTIVE],
    });
    const draftQuote = buildCandidate({
      name: 'Send quote',
      statuses: [WorkflowStatus.DRAFT],
    });

    it('should require every rule with AND', () => {
      const predicate = buildPredicate(
        [nameRule, statusRule],
        CoreWorkflowFilterLogicalOperator.AND,
      );

      expect(predicate(activeInvoice)).toBe(true);
      expect(predicate(draftInvoice)).toBe(false);
      expect(predicate(activeQuote)).toBe(false);
    });

    it('should require any rule with OR', () => {
      const predicate = buildPredicate(
        [nameRule, statusRule],
        CoreWorkflowFilterLogicalOperator.OR,
      );

      expect(predicate(draftInvoice)).toBe(true);
      expect(predicate(activeQuote)).toBe(true);
      expect(predicate(draftQuote)).toBe(false);
    });
  });
});
