import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { evaluateConditionalDisplayWithObjectMetadata } from '@/conditional-display/utils/evaluateConditionalDisplayWithObjectMetadata';
import { isArray, isBoolean, isNumber, isString } from '@sniptt/guards';
import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from 'twenty-shared/constants';
import {
  CONDITIONAL_AVAILABILITY_EXPRESSION_CORPUS,
  evaluateConditionalAvailabilityExpression,
} from 'twenty-shared/testing';
import {
  type ConditionalDisplay,
  type ConditionalDisplayRecordFilter,
  ContextStorePageType,
  FieldMetadataType,
  type ObjectRecord,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  compileConditionalAvailabilityExpression,
  isDefined,
  isPlainObject,
  parseJson,
  removePropertiesFromRecord,
} from 'twenty-shared/utils';

type MatrixSubject = {
  name: string;
  values: unknown[];
};

type DeletableContextKeys = {
  contextKeys: (keyof ConditionalDisplayEvaluationContext)[];
  isTopLevelConjunct: boolean;
};

type FailClosedViolation = {
  deletedContextKeys: (keyof ConditionalDisplayEvaluationContext)[];
  context: ConditionalDisplayEvaluationContext;
};

const MAXIMUM_COMBINATIONS_PER_SELECTION_SIZE = 10000;

const SELECTION_SIZES_WITH_RECORDS = [0, 1, 2];

const SELECTION_SIZES_WITHOUT_RECORDS = [0, 1, 2, 9, 10];

const FAVORITE_RECORD_COUNTS = [0, 1, 2];

const RECORD_PATH_SUBJECT_PREFIX = 'record';

const FAVORITE_RECORD_COUNT_SUBJECT = 'favoriteRecordCount';

const DISTINCT_CORPUS_EXPRESSIONS = [
  ...new Set(CONDITIONAL_AVAILABILITY_EXPRESSION_CORPUS),
];

const BASE_OBJECT_PERMISSIONS = {
  objectMetadataId: 'object-metadata-id',
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const getDistinctValues = (values: unknown[]): unknown[] =>
  values.filter(
    (value, index) =>
      values.findIndex(
        (otherValue) => JSON.stringify(otherValue) === JSON.stringify(value),
      ) === index,
  );

const getMapEntryValues = (
  recordFilters: ConditionalDisplayRecordFilter[],
): unknown[] => {
  const literals = recordFilters.flatMap(({ value }) => {
    const literal = parseJson<unknown>(value);

    return isArray(literal) ? literal : [literal];
  });

  if (recordFilters.some(({ value }) => !isDefined(value))) {
    return [{}, undefined];
  }

  if (literals.some(isString)) {
    return [...getDistinctValues(literals), 'other', undefined];
  }

  return [true, false, undefined];
};

const getRecordPathValues = ({
  path,
  recordFilters,
  expression,
  paths,
}: {
  path: string;
  recordFilters: ConditionalDisplayRecordFilter[];
  expression: string;
  paths: string[];
}): unknown[] => {
  if (expression.includes(`"${path}.length"`)) {
    return [[1], [], null, undefined];
  }

  if (paths.some((otherPath) => otherPath.startsWith(`${path}.`))) {
    return [{}, null, undefined];
  }

  const values = recordFilters.flatMap(({ operand, value }) => {
    const literal = parseJson<unknown>(value);

    if (
      operand === ViewFilterOperand.CONTAINS ||
      operand === ViewFilterOperand.DOES_NOT_CONTAIN
    ) {
      return [[literal], ['other'], []];
    }

    if (isBoolean(literal)) {
      return [true, false];
    }

    if (isDefined(literal)) {
      return [literal, 'other'];
    }

    return expression.includes(`someNonEmptyString(selectedRecords, "${path}")`)
      ? ['other', '']
      : ['other'];
  });

  return [...getDistinctValues(values), null, undefined];
};

const getMatrixSubjects = ({
  expression,
  recordFilters,
}: {
  expression: string;
  recordFilters: ConditionalDisplayRecordFilter[];
}): {
  contextSubjects: MatrixSubject[];
  recordPathSubjects: MatrixSubject[];
} => {
  const contextSubjects: MatrixSubject[] = [];
  const recordPathSubjects: MatrixSubject[] = [];

  const recordFiltersBySubject = new Map<
    string,
    ConditionalDisplayRecordFilter[]
  >();

  recordFilters.forEach((recordFilter) => {
    const subjectName = isDefined(recordFilter.subFieldName)
      ? `${recordFilter.contextKey}.${recordFilter.subFieldName}`
      : `${recordFilter.contextKey}`;

    recordFiltersBySubject.set(subjectName, [
      ...(recordFiltersBySubject.get(subjectName) ?? []),
      recordFilter,
    ]);
  });

  const recordPaths = recordFilters
    .filter(({ contextKey }) => contextKey === 'selectedRecords')
    .map(({ subFieldName }) => subFieldName ?? '');

  recordFiltersBySubject.forEach((subjectRecordFilters, subjectName) => {
    const contextKey = subjectRecordFilters[0]?.contextKey;
    const subFieldName = subjectRecordFilters[0]?.subFieldName;

    if (!isDefined(contextKey)) {
      return;
    }

    const { subject } = CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey];

    switch (subject.kind) {
      case 'value':
        if (
          subject.field.type === FieldMetadataType.BOOLEAN &&
          contextKey !== 'areAllSelectedRecordsFavorites'
        ) {
          contextSubjects.push({ name: subjectName, values: [true, false] });
        }

        if (subject.field.type === FieldMetadataType.SELECT) {
          contextSubjects.push({
            name: subjectName,
            values: [...(subject.field.options ?? [])],
          });
        }

        if (subject.field.type === FieldMetadataType.TEXT) {
          contextSubjects.push({ name: subjectName, values: ['Label', ''] });
        }

        return;
      case 'mapEntry':
      case 'property':
        contextSubjects.push({
          name: subjectName,
          values:
            contextKey === 'objectPermissions'
              ? [true, false]
              : getMapEntryValues(subjectRecordFilters),
        });

        return;
      case 'selectedRecordPath':
        recordPathSubjects.push({
          name: subFieldName ?? '',
          values: getRecordPathValues({
            path: subFieldName ?? '',
            recordFilters: subjectRecordFilters,
            expression,
            paths: recordPaths,
          }),
        });

        return;
    }
  });

  return { contextSubjects, recordPathSubjects };
};

const enumerateCombinations = (subjects: MatrixSubject[]): number[][] => {
  const combinationCount = subjects.reduce(
    (count, { values }) => count * values.length,
    1,
  );

  const getCombination = (combinationIndex: number) =>
    subjects.reduce<{ remainder: number; valueIndexes: number[] }>(
      ({ remainder, valueIndexes }, { values }) => ({
        remainder: Math.floor(remainder / values.length),
        valueIndexes: [...valueIndexes, remainder % values.length],
      }),
      { remainder: combinationIndex, valueIndexes: [] },
    ).valueIndexes;

  if (combinationCount <= MAXIMUM_COMBINATIONS_PER_SELECTION_SIZE) {
    return Array.from({ length: combinationCount }, (_, combinationIndex) =>
      getCombination(combinationIndex),
    );
  }

  let seed = combinationCount % 2147483647;

  const nextRandom = () => {
    seed = (seed * 48271) % 2147483647;

    return seed / 2147483647;
  };

  return [
    subjects.map(() => 0),
    subjects.map(({ values }) => values.length - 1),
    ...Array.from({ length: MAXIMUM_COMBINATIONS_PER_SELECTION_SIZE - 2 }, () =>
      subjects.map(({ values }) => Math.floor(nextRandom() * values.length)),
    ),
  ];
};

const buildRecord = ({
  recordIndex,
  recordPathValues,
}: {
  recordIndex: number;
  recordPathValues: Map<string, unknown>;
}): ObjectRecord => {
  const record: ObjectRecord = { id: `record-${recordIndex}` };

  const sortedPaths = [...recordPathValues.keys()].sort(
    (path, otherPath) => path.split('.').length - otherPath.split('.').length,
  );

  sortedPaths.forEach((path) => {
    const value = recordPathValues.get(path);

    if (value === undefined) {
      return;
    }

    const pathParts = path.split('.');
    const leafPart = pathParts.pop() ?? '';

    const container = pathParts.reduce<Record<string, unknown> | undefined>(
      (currentContainer, part, partIndex) => {
        if (!isDefined(currentContainer)) {
          return undefined;
        }

        const prefix = pathParts.slice(0, partIndex + 1).join('.');
        const existingValue = currentContainer[part];

        if (existingValue === undefined && !recordPathValues.has(prefix)) {
          const createdContainer: Record<string, unknown> = {};

          currentContainer[part] = createdContainer;

          return createdContainer;
        }

        return isPlainObject(existingValue) ? existingValue : undefined;
      },
      record,
    );

    if (isDefined(container)) {
      container[leafPart] = isPlainObject(value) ? {} : value;
    }
  });

  return record;
};

const buildBooleanMap = ({
  contextKey,
  assignments,
}: {
  contextKey: string;
  assignments: Map<string, unknown>;
}): Record<string, boolean> =>
  Object.fromEntries(
    [...assignments.entries()].flatMap(([subjectName, value]) =>
      subjectName.startsWith(`${contextKey}.`) && isBoolean(value)
        ? [[subjectName.slice(contextKey.length + 1), value]]
        : [],
    ),
  );

const buildRoundTripContext = ({
  assignments,
  selectedRecords,
  numberOfSelectedRecords,
  favoriteRecordCount,
}: {
  assignments: Map<string, unknown>;
  selectedRecords: ObjectRecord[];
  numberOfSelectedRecords: number;
  favoriteRecordCount: number;
}): ConditionalDisplayEvaluationContext => {
  const readBoolean = (key: string) => {
    const value = assignments.get(key);

    return isBoolean(value) ? value : false;
  };

  const objectPermissions = {
    ...BASE_OBJECT_PERMISSIONS,
    ...buildBooleanMap({ contextKey: 'objectPermissions', assignments }),
  };

  const objectMetadataItem = Object.fromEntries(
    [...assignments.entries()].flatMap(([subjectName, value]) =>
      subjectName.startsWith('objectMetadataItem.') && value !== undefined
        ? [[subjectName.slice('objectMetadataItem.'.length), value]]
        : [],
    ),
  );

  const favoriteRecordIds = Array.from(
    { length: favoriteRecordCount },
    (_, favoriteIndex) => `record-${favoriteIndex}`,
  );

  const pageType = Object.values(ContextStorePageType).find(
    (contextStorePageType) =>
      contextStorePageType === assignments.get('pageType'),
  );

  const objectMetadataLabel = assignments.get('objectMetadataLabel');

  return {
    pageType: pageType ?? ContextStorePageType.Index,
    isInSidePanel: readBoolean('isInSidePanel'),
    isDashboardPageLayoutInEditMode: readBoolean(
      'isDashboardPageLayoutInEditMode',
    ),
    isLayoutCustomizationModeEnabled: readBoolean(
      'isLayoutCustomizationModeEnabled',
    ),
    favoriteRecordIds,
    isSelectAll: readBoolean('isSelectAll'),
    hasAnySoftDeleteFilterOnView: readBoolean('hasAnySoftDeleteFilterOnView'),
    numberOfSelectedRecords,
    objectPermissions,
    selectedRecords,
    featureFlags: buildBooleanMap({ contextKey: 'featureFlags', assignments }),
    permissionFlags: buildBooleanMap({
      contextKey: 'permissionFlags',
      assignments,
    }),
    targetObjectReadPermissions: buildBooleanMap({
      contextKey: 'targetObjectReadPermissions',
      assignments,
    }),
    targetObjectWritePermissions: buildBooleanMap({
      contextKey: 'targetObjectWritePermissions',
      assignments,
    }),
    canImpersonate: readBoolean('canImpersonate'),
    canAccessFullAdminPanel: readBoolean('canAccessFullAdminPanel'),
    objectMetadataItem,
    objectMetadataLabel: isString(objectMetadataLabel)
      ? objectMetadataLabel
      : '',
    areAllSelectedRecordsFavorites:
      favoriteRecordIds.length === numberOfSelectedRecords,
  };
};

const evaluateTree = ({
  conditionalDisplay,
  context,
}: {
  conditionalDisplay: ConditionalDisplay | null;
  context: ConditionalDisplayEvaluationContext;
}): boolean =>
  evaluateConditionalDisplayWithObjectMetadata({
    conditionalDisplay,
    context,
    records: context.selectedRecords ?? [],
    objectMetadataItems: [],
  });

const getDeletableContextKeys = (
  conditionalDisplay: ConditionalDisplay | null,
): DeletableContextKeys[] => {
  const recordFilters = conditionalDisplay?.recordFilters ?? [];

  const rootConjunctionRecordFilterGroupId =
    conditionalDisplay?.recordFilterGroups?.find(
      ({ parentRecordFilterGroupId, logicalOperator }) =>
        !isDefined(parentRecordFilterGroupId) &&
        logicalOperator === RecordFilterGroupLogicalOperator.AND,
    )?.id;

  const contextKeys = [
    ...new Set(recordFilters.map(({ contextKey }) => contextKey)),
  ].filter(isDefined);

  return contextKeys
    .filter((contextKey) => contextKey !== 'selectedRecords')
    .map((contextKey) => ({
      contextKeys:
        contextKey === 'areAllSelectedRecordsFavorites'
          ? [contextKey, 'favoriteRecordIds']
          : [contextKey],
      isTopLevelConjunct: recordFilters
        .filter((recordFilter) => recordFilter.contextKey === contextKey)
        .every(
          ({ recordFilterGroupId }) =>
            !isDefined(recordFilterGroupId) ||
            recordFilterGroupId === rootConjunctionRecordFilterGroupId,
        ),
    }));
};

const runRoundTrip = (expression: string) => {
  const conditionalDisplay =
    compileConditionalAvailabilityExpression(expression);
  const recordFilters = conditionalDisplay?.recordFilters ?? [];

  const { contextSubjects, recordPathSubjects } = getMatrixSubjects({
    expression,
    recordFilters,
  });

  const isFavoriteCountReferenced = recordFilters.some(
    ({ contextKey }) => contextKey === 'areAllSelectedRecordsFavorites',
  );
  const isSelectionCountReferenced = recordFilters.some(
    ({ contextKey }) => contextKey === 'numberOfSelectedRecords',
  );

  const selectionSizes =
    recordPathSubjects.length > 0
      ? SELECTION_SIZES_WITH_RECORDS
      : isSelectionCountReferenced || isFavoriteCountReferenced
        ? SELECTION_SIZES_WITHOUT_RECORDS
        : [0];

  const deletableContextKeys = getDeletableContextKeys(conditionalDisplay);

  const outcomes = new Set<boolean>();
  let evaluatedContextCount = 0;
  let mismatchingContext: ConditionalDisplayEvaluationContext | undefined;
  let failClosedViolation: FailClosedViolation | undefined;

  selectionSizes.forEach((selectionSize) => {
    const recordCount = recordPathSubjects.length > 0 ? selectionSize : 0;

    const subjects: MatrixSubject[] = [
      ...contextSubjects,
      ...Array.from({ length: recordCount }, (_, recordIndex) =>
        recordPathSubjects.map(({ name, values }) => ({
          name: `${RECORD_PATH_SUBJECT_PREFIX}:${recordIndex}:${name}`,
          values,
        })),
      ).flat(),
      {
        name: FAVORITE_RECORD_COUNT_SUBJECT,
        values: isFavoriteCountReferenced
          ? FAVORITE_RECORD_COUNTS.filter((count) => count <= selectionSize)
          : [0],
      },
    ];

    enumerateCombinations(subjects).forEach((valueIndexes) => {
      if (isDefined(mismatchingContext)) {
        return;
      }

      const assignments = new Map(
        subjects.map(({ name, values }, subjectIndex) => [
          name,
          values[valueIndexes[subjectIndex] ?? 0],
        ]),
      );

      const selectedRecords = Array.from(
        { length: recordCount },
        (_, recordIndex) =>
          buildRecord({
            recordIndex,
            recordPathValues: new Map(
              recordPathSubjects.map(({ name }) => [
                name,
                assignments.get(
                  `${RECORD_PATH_SUBJECT_PREFIX}:${recordIndex}:${name}`,
                ),
              ]),
            ),
          }),
      );

      const favoriteRecordCount = assignments.get(
        FAVORITE_RECORD_COUNT_SUBJECT,
      );

      const context = buildRoundTripContext({
        assignments,
        selectedRecords,
        numberOfSelectedRecords: selectionSize,
        favoriteRecordCount: isNumber(favoriteRecordCount)
          ? favoriteRecordCount
          : 0,
      });

      const expressionOutcome = evaluateConditionalAvailabilityExpression(
        expression,
        context,
      );
      const treeOutcome = evaluateTree({ conditionalDisplay, context });

      evaluatedContextCount += 1;
      outcomes.add(expressionOutcome);

      if (expressionOutcome !== treeOutcome) {
        mismatchingContext = context;
      }

      deletableContextKeys.forEach(({ contextKeys, isTopLevelConjunct }) => {
        if (isDefined(failClosedViolation)) {
          return;
        }

        const contextWithoutKeys = removePropertiesFromRecord(
          context,
          contextKeys,
        );

        const expressionOutcomeWithoutKeys =
          evaluateConditionalAvailabilityExpression(
            expression,
            contextWithoutKeys,
          );
        const treeOutcomeWithoutKeys = evaluateTree({
          conditionalDisplay,
          context: contextWithoutKeys,
        });

        const isFailingClosed = isTopLevelConjunct
          ? treeOutcomeWithoutKeys === expressionOutcomeWithoutKeys
          : !treeOutcomeWithoutKeys || expressionOutcome;

        if (!isFailingClosed) {
          failClosedViolation = { deletedContextKeys: contextKeys, context };
        }
      });
    });
  });

  return {
    evaluatedContextCount,
    outcomes,
    mismatchingContext,
    failClosedViolation,
  };
};

describe('evaluateConditionalDisplayWithObjectMetadata round trip', () => {
  it.each(DISTINCT_CORPUS_EXPRESSIONS)(
    'should evaluate the compiled tree like the expression %s',
    (expression) => {
      const {
        evaluatedContextCount,
        outcomes,
        mismatchingContext,
        failClosedViolation,
      } = runRoundTrip(expression);

      expect({ expression, mismatchingContext, failClosedViolation }).toEqual({
        expression,
        mismatchingContext: undefined,
        failClosedViolation: undefined,
      });
      expect(evaluatedContextCount).toBeGreaterThan(0);
      expect([...outcomes].sort()).toEqual([false, true]);
    },
  );

  it('should keep a single-record guard false when no record is loaded', () => {
    const expression =
      'numberOfSelectedRecords == 1 and (everyEquals(selectedRecords, "status", "DRAFT") or everyEquals(selectedRecords, "status", "SCHEDULED"))';
    const context = buildRoundTripContext({
      assignments: new Map(),
      selectedRecords: [],
      numberOfSelectedRecords: 1,
      favoriteRecordCount: 0,
    });

    expect(evaluateConditionalAvailabilityExpression(expression, context)).toBe(
      false,
    );
    expect(
      evaluateTree({
        conditionalDisplay:
          compileConditionalAvailabilityExpression(expression),
        context,
      }),
    ).toBe(false);
  });

  it.each([
    'isNonEmptyString(pageType)',
    'isNonEmptyString(objectMetadataItem.nameSingular)',
    'isNonEmptyString(objectMetadataLabel)',
    'includes(["INDEX_PAGE", "RECORD_PAGE"], pageType)',
    'includes(["company", "person"], objectMetadataItem.nameSingular)',
    'arrayLength(favoriteRecordIds) != numberOfSelectedRecords',
  ])(
    'should evaluate the compiled documented helper formula %s like the expression',
    (expression) => {
      const conditionalDisplay =
        compileConditionalAvailabilityExpression(expression);

      const objectMetadataItemCases = [
        { objectMetadataItem: {}, objectMetadataLabel: '' },
        {
          objectMetadataItem: { nameSingular: 'company' },
          objectMetadataLabel: 'Companies',
        },
        {
          objectMetadataItem: { nameSingular: 'note' },
          objectMetadataLabel: 'Note',
        },
      ];

      const contexts = Object.values(ContextStorePageType).flatMap((pageType) =>
        objectMetadataItemCases.flatMap((objectMetadataItemCase) =>
          [0, 1, 2].flatMap((numberOfSelectedRecords) =>
            FAVORITE_RECORD_COUNTS.filter(
              (favoriteRecordCount) =>
                favoriteRecordCount <= numberOfSelectedRecords,
            ).map((favoriteRecordCount) => ({
              ...buildRoundTripContext({
                assignments: new Map([['pageType', pageType]]),
                selectedRecords: [],
                numberOfSelectedRecords,
                favoriteRecordCount,
              }),
              ...objectMetadataItemCase,
            })),
          ),
        ),
      );

      const mismatchingContexts = contexts.filter(
        (context) =>
          evaluateConditionalAvailabilityExpression(expression, context) !==
          evaluateTree({ conditionalDisplay, context }),
      );

      expect(mismatchingContexts).toEqual([]);
    },
  );
});
