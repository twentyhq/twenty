import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import {
  escapeForIlike,
  getNextPeriodStart,
  getPeriodStart,
  isDefined,
  isNonEmptyArray,
  resolveRelativeDateTimeFilter,
  safeParseRelativeDateFilterJsonStringified,
} from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  CoreWorkflowFilterFieldKey,
  type CoreWorkflowFilterInput,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  type CoreWorkflowFilterRuleInput,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';
import {
  buildCoreWorkflowHasAnyOfStatusesPredicate,
  CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE,
} from 'src/engine/core-modules/workflow/utils/build-core-workflow-status-predicate.util';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

const NAME_COLUMN = 'c.name';
const UPDATED_AT_COLUMN = 'c."updatedAt"';
const CORE_WORKFLOW_STATUS_VALUES: WorkflowStatus[] =
  Object.values(WorkflowStatus);

type BindParameter = (value: unknown) => string;

type RulePredicateBuilder = (context: {
  rule: CoreWorkflowFilterRuleInput;
  bindParameter: BindParameter;
}) => string;

export type CoreWorkflowFilterPredicate = {
  predicate?: string;
  parameters: unknown[];
};

const requireTextValue = (rule: CoreWorkflowFilterRuleInput): string => {
  const trimmedValue = rule.value?.trim();

  if (!isNonEmptyString(trimmedValue)) {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires a value`,
    );
  }

  return trimmedValue;
};

// STATUSES and UPDATED_AT values travel JSON encoded, but a bare status or a
// bare ISO string is not valid JSON and would otherwise be rejected outright
const parseJsonValue = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseStatusValue = ({
  candidate,
  rule,
}: {
  candidate: unknown;
  rule: CoreWorkflowFilterRuleInput;
}): WorkflowStatus => {
  const status =
    typeof candidate === 'string'
      ? CORE_WORKFLOW_STATUS_VALUES.find(
          (statusValue) => statusValue === candidate,
        )
      : undefined;

  if (!isDefined(status)) {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires workflow statuses among ${CORE_WORKFLOW_STATUS_VALUES.join(', ')}`,
    );
  }

  return status;
};

const parseStatusesValue = (
  rule: CoreWorkflowFilterRuleInput,
): WorkflowStatus[] => {
  const rawValue = requireTextValue(rule);
  let candidates: unknown[];

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      throw new UserInputError(
        `Operand ${rule.operand} on field ${rule.fieldKey} requires a JSON array of workflow statuses`,
      );
    }

    candidates = parsedValue;
  } catch (error) {
    if (error instanceof UserInputError) {
      throw error;
    }

    candidates = [rawValue];
  }

  const statuses = candidates.map((candidate) =>
    parseStatusValue({ candidate, rule }),
  );

  if (!isNonEmptyArray(statuses)) {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires at least one workflow status`,
    );
  }

  return statuses;
};

const parseDateValue = (rule: CoreWorkflowFilterRuleInput): Date => {
  const rawValue = requireTextValue(rule);
  const parsedValue = parseJsonValue(rawValue);
  const date = new Date(
    typeof parsedValue === 'string' ? parsedValue : rawValue,
  );

  if (Number.isNaN(date.getTime())) {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires an ISO 8601 date value`,
    );
  }

  return date;
};

const computeDayBounds = (
  zonedDateTime: Temporal.ZonedDateTime,
): { dayStart: string; nextDayStart: string } => ({
  dayStart: getPeriodStart(zonedDateTime, 'DAY').toInstant().toString(),
  nextDayStart: getNextPeriodStart(zonedDateTime, 'DAY').toInstant().toString(),
});

const toRuleZonedDateTime = ({
  date,
  rule,
}: {
  date: Date;
  rule: CoreWorkflowFilterRuleInput;
}): Temporal.ZonedDateTime =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(
    rule.timezone ?? 'UTC',
  );

const parseRelativeDateRange = (
  rule: CoreWorkflowFilterRuleInput,
): { start: string; end: string } => {
  const relativeDateFilter = safeParseRelativeDateFilterJsonStringified(
    requireTextValue(rule),
  );

  if (!isDefined(relativeDateFilter)) {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires a relative date filter value`,
    );
  }

  let referenceZonedDateTime: Temporal.ZonedDateTime;

  try {
    referenceZonedDateTime = isDefined(relativeDateFilter.timezone)
      ? Temporal.Now.zonedDateTimeISO(relativeDateFilter.timezone)
      : Temporal.Now.zonedDateTimeISO();
  } catch {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} carries an invalid timezone`,
    );
  }

  const resolvedFilter = resolveRelativeDateTimeFilter(
    relativeDateFilter,
    referenceZonedDateTime.round({ smallestUnit: 'second' }),
  );

  return {
    start: resolvedFilter.start.toInstant().toString(),
    end: resolvedFilter.end.toInstant().toString(),
  };
};

const buildUpdatedAtRangePredicate = ({
  bindParameter,
  start,
  end,
}: {
  bindParameter: BindParameter;
  start: string;
  end: string;
}): string =>
  `(${UPDATED_AT_COLUMN} >= ${bindParameter(start)}::timestamptz AND ${UPDATED_AT_COLUMN} < ${bindParameter(end)}::timestamptz)`;

const buildNameIlikePredicate = ({
  bindParameter,
  pattern,
  negated,
}: {
  bindParameter: BindParameter;
  pattern: string;
  negated: boolean;
}): string => {
  const comparison = `${NAME_COLUMN} ${negated ? 'NOT ILIKE' : 'ILIKE'} ${bindParameter(pattern)} ESCAPE '\\'`;

  // a workflow without a name matches no positive text rule, and matches every
  // negative one, which SQL three-valued logic would otherwise drop
  return negated ? `(${NAME_COLUMN} IS NULL OR ${comparison})` : comparison;
};

const buildUpdatedAtComparisonPredicate = ({
  bindParameter,
  rule,
  sqlOperator,
}: {
  bindParameter: BindParameter;
  rule: CoreWorkflowFilterRuleInput;
  sqlOperator: '<' | '>=';
}): string =>
  `${UPDATED_AT_COLUMN} ${sqlOperator} ${bindParameter(parseDateValue(rule).toISOString())}::timestamptz`;

// null marks an operand the field does not support; every operand has to be
// listed so a new one cannot silently fall through
const PREDICATE_BUILDER_BY_OPERAND_BY_FIELD_KEY: Record<
  CoreWorkflowFilterFieldKey,
  Record<CoreWorkflowFilterOperand, RulePredicateBuilder | null>
> = {
  [CoreWorkflowFilterFieldKey.NAME]: {
    [CoreWorkflowFilterOperand.CONTAINS]: ({ rule, bindParameter }) =>
      buildNameIlikePredicate({
        bindParameter,
        pattern: `%${escapeForIlike(requireTextValue(rule))}%`,
        negated: false,
      }),
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: ({ rule, bindParameter }) =>
      buildNameIlikePredicate({
        bindParameter,
        pattern: `%${escapeForIlike(requireTextValue(rule))}%`,
        negated: true,
      }),
    [CoreWorkflowFilterOperand.IS]: ({ rule, bindParameter }) =>
      buildNameIlikePredicate({
        bindParameter,
        pattern: escapeForIlike(requireTextValue(rule)),
        negated: false,
      }),
    [CoreWorkflowFilterOperand.IS_NOT]: ({ rule, bindParameter }) =>
      buildNameIlikePredicate({
        bindParameter,
        pattern: escapeForIlike(requireTextValue(rule)),
        negated: true,
      }),
    [CoreWorkflowFilterOperand.IS_EMPTY]: () =>
      `(${NAME_COLUMN} IS NULL OR ${NAME_COLUMN} = '')`,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: () =>
      `(${NAME_COLUMN} IS NOT NULL AND ${NAME_COLUMN} <> '')`,
    [CoreWorkflowFilterOperand.IS_BEFORE]: null,
    [CoreWorkflowFilterOperand.IS_AFTER]: null,
    [CoreWorkflowFilterOperand.IS_IN_PAST]: null,
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: null,
    [CoreWorkflowFilterOperand.IS_TODAY]: null,
    [CoreWorkflowFilterOperand.IS_RELATIVE]: null,
  },
  [CoreWorkflowFilterFieldKey.STATUSES]: {
    [CoreWorkflowFilterOperand.CONTAINS]: ({ rule }) =>
      buildCoreWorkflowHasAnyOfStatusesPredicate(parseStatusesValue(rule)),
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: ({ rule }) =>
      `(NOT ${buildCoreWorkflowHasAnyOfStatusesPredicate(parseStatusesValue(rule))})`,
    [CoreWorkflowFilterOperand.IS_EMPTY]: () =>
      `(NOT ${CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE})`,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: () =>
      CORE_WORKFLOW_HAS_ANY_STATUS_PREDICATE,
    [CoreWorkflowFilterOperand.IS]: null,
    [CoreWorkflowFilterOperand.IS_NOT]: null,
    [CoreWorkflowFilterOperand.IS_BEFORE]: null,
    [CoreWorkflowFilterOperand.IS_AFTER]: null,
    [CoreWorkflowFilterOperand.IS_IN_PAST]: null,
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: null,
    [CoreWorkflowFilterOperand.IS_TODAY]: null,
    [CoreWorkflowFilterOperand.IS_RELATIVE]: null,
  },
  [CoreWorkflowFilterFieldKey.UPDATED_AT]: {
    [CoreWorkflowFilterOperand.IS]: ({ rule, bindParameter }) => {
      const { dayStart, nextDayStart } = computeDayBounds(
        toRuleZonedDateTime({ date: parseDateValue(rule), rule }),
      );

      return buildUpdatedAtRangePredicate({
        bindParameter,
        start: dayStart,
        end: nextDayStart,
      });
    },
    [CoreWorkflowFilterOperand.IS_BEFORE]: ({ rule, bindParameter }) =>
      buildUpdatedAtComparisonPredicate({
        bindParameter,
        rule,
        sqlOperator: '<',
      }),
    [CoreWorkflowFilterOperand.IS_AFTER]: ({ rule, bindParameter }) =>
      buildUpdatedAtComparisonPredicate({
        bindParameter,
        rule,
        sqlOperator: '>=',
      }),
    [CoreWorkflowFilterOperand.IS_IN_PAST]: () =>
      `${UPDATED_AT_COLUMN} < now()`,
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: () =>
      `${UPDATED_AT_COLUMN} > now()`,
    [CoreWorkflowFilterOperand.IS_TODAY]: ({ rule, bindParameter }) => {
      const { dayStart, nextDayStart } = computeDayBounds(
        Temporal.Now.zonedDateTimeISO(rule.timezone ?? 'UTC'),
      );

      return buildUpdatedAtRangePredicate({
        bindParameter,
        start: dayStart,
        end: nextDayStart,
      });
    },
    [CoreWorkflowFilterOperand.IS_RELATIVE]: ({ rule, bindParameter }) => {
      const { start, end } = parseRelativeDateRange(rule);

      return buildUpdatedAtRangePredicate({ bindParameter, start, end });
    },
    [CoreWorkflowFilterOperand.IS_EMPTY]: () => `${UPDATED_AT_COLUMN} IS NULL`,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: () =>
      `${UPDATED_AT_COLUMN} IS NOT NULL`,
    [CoreWorkflowFilterOperand.CONTAINS]: null,
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: null,
    [CoreWorkflowFilterOperand.IS_NOT]: null,
  },
};

const SEPARATOR_BY_LOGICAL_OPERATOR: Record<
  CoreWorkflowFilterLogicalOperator,
  string
> = {
  [CoreWorkflowFilterLogicalOperator.AND]: ' AND ',
  [CoreWorkflowFilterLogicalOperator.OR]: ' OR ',
};

const buildRulePredicate = ({
  rule,
  bindParameter,
}: {
  rule: CoreWorkflowFilterRuleInput;
  bindParameter: BindParameter;
}): string => {
  const buildPredicate =
    PREDICATE_BUILDER_BY_OPERAND_BY_FIELD_KEY[rule.fieldKey][rule.operand];

  if (!isDefined(buildPredicate)) {
    throw new UserInputError(
      `Operand ${rule.operand} is not supported on field ${rule.fieldKey}`,
    );
  }

  return buildPredicate({ rule, bindParameter });
};

// Every rule lands in the same HAVING clause: NAME and UPDATED_AT are grouping
// columns of the workflow row, STATUS is an aggregate over its versions, so
// mixing both kinds under OR stays a single expression instead of an
// unsplittable WHERE/HAVING pair
export const buildCoreWorkflowFilterPredicate = ({
  filter,
  firstParameterIndex,
}: {
  filter?: CoreWorkflowFilterInput | null;
  firstParameterIndex: number;
}): CoreWorkflowFilterPredicate => {
  if (!isDefined(filter) || !isNonEmptyArray(filter.rules)) {
    return { parameters: [] };
  }

  const parameters: unknown[] = [];
  const bindParameter: BindParameter = (value) => {
    parameters.push(value);

    return `$${firstParameterIndex + parameters.length - 1}`;
  };

  const rulePredicates = filter.rules.map((rule) =>
    buildRulePredicate({ rule, bindParameter }),
  );

  return {
    predicate: `(${rulePredicates.join(SEPARATOR_BY_LOGICAL_OPERATOR[filter.logicalOperator])})`,
    parameters,
  };
};
