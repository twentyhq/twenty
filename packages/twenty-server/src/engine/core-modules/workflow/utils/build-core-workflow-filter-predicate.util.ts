import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import {
  getNextPeriodStart,
  getPeriodStart,
  isDefined,
  isNonEmptyArray,
  resolveRelativeDateTimeFilter,
  safeParseRelativeDateFilterJsonStringified,
} from 'twenty-shared/utils';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import {
  CoreWorkflowFilterFieldKey,
  type CoreWorkflowFilterInput,
  CoreWorkflowFilterLogicalOperator,
  CoreWorkflowFilterOperand,
  type CoreWorkflowFilterRuleInput,
} from 'src/engine/core-modules/workflow/dtos/core-workflow-filter.input';

const CORE_WORKFLOW_STATUS_VALUES: WorkflowStatus[] =
  Object.values(WorkflowStatus);

export type CoreWorkflowFilterCandidate = {
  name: string | null;
  updatedAt: string;
  isSystem: boolean;
  statuses: WorkflowStatus[];
};

export type CoreWorkflowFilterPredicate = (
  candidate: CoreWorkflowFilterCandidate,
) => boolean;

type CoreWorkflowUpdatedAtRange = { start: number; end: number };

type RulePredicateBuilder = (
  rule: CoreWorkflowFilterRuleInput,
) => CoreWorkflowFilterPredicate;

const requireExactTextValue = (rule: CoreWorkflowFilterRuleInput): string => {
  if (!isNonEmptyString(rule.value) || rule.value.trim() === '') {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires a value`,
    );
  }

  return rule.value;
};

const requireTextValue = (rule: CoreWorkflowFilterRuleInput): string =>
  requireExactTextValue(rule).trim();

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

const parseBooleanValue = (rule: CoreWorkflowFilterRuleInput): boolean => {
  const rawValue = requireTextValue(rule);

  if (rawValue !== 'true' && rawValue !== 'false') {
    throw new UserInputError(
      `Operand ${rule.operand} on field ${rule.fieldKey} requires true or false`,
    );
  }

  return rawValue === 'true';
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
): CoreWorkflowUpdatedAtRange => ({
  start: getPeriodStart(zonedDateTime, 'DAY').toInstant().epochMilliseconds,
  end: getNextPeriodStart(zonedDateTime, 'DAY').toInstant().epochMilliseconds,
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
): CoreWorkflowUpdatedAtRange => {
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
    referenceZonedDateTime = Temporal.Now.zonedDateTimeISO(
      relativeDateFilter.timezone ?? rule.timezone ?? 'UTC',
    );
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
    start: resolvedFilter.start.toInstant().epochMilliseconds,
    end: resolvedFilter.end.toInstant().epochMilliseconds,
  };
};

const getUpdatedAtTime = ({
  updatedAt,
}: Pick<CoreWorkflowFilterCandidate, 'updatedAt'>): number =>
  Date.parse(updatedAt);

const buildUpdatedAtRangePredicate =
  ({ start, end }: CoreWorkflowUpdatedAtRange): CoreWorkflowFilterPredicate =>
  (candidate) => {
    const updatedAtTime = getUpdatedAtTime(candidate);

    return updatedAtTime >= start && updatedAtTime < end;
  };

const buildNameContainsPredicate = ({
  rule,
  negated,
}: {
  rule: CoreWorkflowFilterRuleInput;
  negated: boolean;
}): CoreWorkflowFilterPredicate => {
  const searchedText = requireTextValue(rule).toLowerCase();

  return ({ name }) => {
    if (!isDefined(name)) {
      return negated;
    }

    return name.toLowerCase().includes(searchedText) !== negated;
  };
};

const isNameEmpty = ({
  name,
}: Pick<CoreWorkflowFilterCandidate, 'name'>): boolean =>
  !isDefined(name) || name === '';

const buildHasAnyOfStatusesPredicate =
  (selectedStatuses: WorkflowStatus[]): CoreWorkflowFilterPredicate =>
  ({ statuses }) =>
    statuses.some((status) => selectedStatuses.includes(status));

const PREDICATE_BUILDER_BY_OPERAND_BY_FIELD_KEY: Record<
  CoreWorkflowFilterFieldKey,
  Record<CoreWorkflowFilterOperand, RulePredicateBuilder | null>
> = {
  [CoreWorkflowFilterFieldKey.NAME]: {
    [CoreWorkflowFilterOperand.CONTAINS]: (rule) =>
      buildNameContainsPredicate({ rule, negated: false }),
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: (rule) =>
      buildNameContainsPredicate({ rule, negated: true }),
    [CoreWorkflowFilterOperand.IS]: (rule) => {
      const expectedName = requireExactTextValue(rule);

      return ({ name }) => name === expectedName;
    },
    [CoreWorkflowFilterOperand.IS_NOT]: (rule) => {
      const excludedName = requireExactTextValue(rule);

      return ({ name }) => name !== excludedName;
    },
    [CoreWorkflowFilterOperand.IS_EMPTY]: () => isNameEmpty,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: () => (candidate) =>
      !isNameEmpty(candidate),
    [CoreWorkflowFilterOperand.IS_BEFORE]: null,
    [CoreWorkflowFilterOperand.IS_AFTER]: null,
    [CoreWorkflowFilterOperand.IS_IN_PAST]: null,
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: null,
    [CoreWorkflowFilterOperand.IS_TODAY]: null,
    [CoreWorkflowFilterOperand.IS_RELATIVE]: null,
  },
  [CoreWorkflowFilterFieldKey.STATUSES]: {
    [CoreWorkflowFilterOperand.CONTAINS]: (rule) =>
      buildHasAnyOfStatusesPredicate(parseStatusesValue(rule)),
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: (rule) => {
      const hasAnyOfStatuses = buildHasAnyOfStatusesPredicate(
        parseStatusesValue(rule),
      );

      return (candidate) => !hasAnyOfStatuses(candidate);
    },
    [CoreWorkflowFilterOperand.IS_EMPTY]:
      () =>
      ({ statuses }) =>
        statuses.length === 0,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]:
      () =>
      ({ statuses }) =>
        statuses.length > 0,
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
    [CoreWorkflowFilterOperand.IS]: (rule) =>
      buildUpdatedAtRangePredicate(
        computeDayBounds(
          toRuleZonedDateTime({ date: parseDateValue(rule), rule }),
        ),
      ),
    [CoreWorkflowFilterOperand.IS_BEFORE]: (rule) => {
      const referenceTime = parseDateValue(rule).getTime();

      return (candidate) => getUpdatedAtTime(candidate) < referenceTime;
    },
    [CoreWorkflowFilterOperand.IS_AFTER]: (rule) => {
      const referenceTime = parseDateValue(rule).getTime();

      return (candidate) => getUpdatedAtTime(candidate) >= referenceTime;
    },
    [CoreWorkflowFilterOperand.IS_IN_PAST]: () => {
      const now = Date.now();

      return (candidate) => getUpdatedAtTime(candidate) < now;
    },
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: () => {
      const now = Date.now();

      return (candidate) => getUpdatedAtTime(candidate) > now;
    },
    [CoreWorkflowFilterOperand.IS_TODAY]: (rule) =>
      buildUpdatedAtRangePredicate(
        computeDayBounds(Temporal.Now.zonedDateTimeISO(rule.timezone ?? 'UTC')),
      ),
    [CoreWorkflowFilterOperand.IS_RELATIVE]: (rule) =>
      buildUpdatedAtRangePredicate(parseRelativeDateRange(rule)),
    [CoreWorkflowFilterOperand.IS_EMPTY]: () => () => false,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: () => () => true,
    [CoreWorkflowFilterOperand.CONTAINS]: null,
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: null,
    [CoreWorkflowFilterOperand.IS_NOT]: null,
  },
  [CoreWorkflowFilterFieldKey.IS_SYSTEM]: {
    [CoreWorkflowFilterOperand.IS]: (rule) => {
      const expectedIsSystem = parseBooleanValue(rule);

      return ({ isSystem }) => isSystem === expectedIsSystem;
    },
    [CoreWorkflowFilterOperand.CONTAINS]: null,
    [CoreWorkflowFilterOperand.DOES_NOT_CONTAIN]: null,
    [CoreWorkflowFilterOperand.IS_NOT]: null,
    [CoreWorkflowFilterOperand.IS_EMPTY]: null,
    [CoreWorkflowFilterOperand.IS_NOT_EMPTY]: null,
    [CoreWorkflowFilterOperand.IS_BEFORE]: null,
    [CoreWorkflowFilterOperand.IS_AFTER]: null,
    [CoreWorkflowFilterOperand.IS_IN_PAST]: null,
    [CoreWorkflowFilterOperand.IS_IN_FUTURE]: null,
    [CoreWorkflowFilterOperand.IS_TODAY]: null,
    [CoreWorkflowFilterOperand.IS_RELATIVE]: null,
  },
};

const buildRulePredicate = (
  rule: CoreWorkflowFilterRuleInput,
): CoreWorkflowFilterPredicate => {
  const buildPredicate =
    PREDICATE_BUILDER_BY_OPERAND_BY_FIELD_KEY[rule.fieldKey][rule.operand];

  if (!isDefined(buildPredicate)) {
    throw new UserInputError(
      `Operand ${rule.operand} is not supported on field ${rule.fieldKey}`,
    );
  }

  return buildPredicate(rule);
};

export const buildCoreWorkflowFilterPredicate = (
  filter: CoreWorkflowFilterInput | null | undefined,
): CoreWorkflowFilterPredicate => {
  if (!isDefined(filter) || !isNonEmptyArray(filter.rules)) {
    return () => true;
  }

  const rulePredicates = filter.rules.map(buildRulePredicate);

  return filter.logicalOperator === CoreWorkflowFilterLogicalOperator.OR
    ? (candidate) =>
        rulePredicates.some((rulePredicate) => rulePredicate(candidate))
    : (candidate) =>
        rulePredicates.every((rulePredicate) => rulePredicate(candidate));
};
