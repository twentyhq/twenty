import { defaultRollupConfig } from './rollupConfig';
import type {
  AggregationConfig,
  FilterConfig,
  RollupConfig,
  RollupDefinition,
} from './types';

const operatorSet = new Set<FilterConfig['operator']>([
  'equals',
  'notEquals',
  'in',
  'notIn',
  'gt',
  'gte',
  'lt',
  'lte',
]);

const aggregationTypes = new Set<AggregationConfig['type']>([
  'SUM',
  'COUNT',
  'MAX',
  'MIN',
  'AVG',
]);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const validateRollupConfig = (config: any): RollupConfig | void => {
  if (!Array.isArray(config)) {
    throw new Error(
      'Rollup configuration must contain an array of rollup definitions',
    );
  }

  config.forEach((definition, definitionIndex) => {
    if (!isObject(definition)) {
      throw new Error(
        `Definition at index ${definitionIndex} must be an object`,
      );
    }

    const {
      parentObject,
      childObject,
      relationField,
      childFilters,
      aggregations,
    } = definition as Partial<RollupDefinition>;

    if (typeof parentObject !== 'string' || parentObject.trim().length === 0) {
      throw new Error(`Definition ${definitionIndex} missing parentObject`);
    }
    if (typeof childObject !== 'string' || childObject.trim().length === 0) {
      throw new Error(`Definition ${definitionIndex} missing childObject`);
    }
    if (
      typeof relationField !== 'string' ||
      relationField.trim().length === 0
    ) {
      throw new Error(`Definition ${definitionIndex} missing relationField`);
    }
    if (!Array.isArray(aggregations) || aggregations.length === 0) {
      throw new Error(
        `Definition ${definitionIndex} must declare at least one aggregation`,
      );
    }

    const filtersToValidate = [
      ...(Array.isArray(childFilters) ? childFilters : []),
      ...aggregations.flatMap((aggregation, aggregationIndex) => {
        if (!isObject(aggregation)) {
          throw new Error(
            `Aggregation ${aggregationIndex} in definition ${definitionIndex} must be an object`,
          );
        }

        const { type, parentField, childField, filters } =
          aggregation as AggregationConfig;

        if (!aggregationTypes.has(type)) {
          throw new Error(
            `Aggregation ${aggregationIndex} in definition ${definitionIndex} has unsupported type ${type}`,
          );
        }

        if (
          typeof parentField !== 'string' ||
          parentField.trim().length === 0
        ) {
          throw new Error(
            `Aggregation ${aggregationIndex} in definition ${definitionIndex} missing parentField`,
          );
        }

        if (
          type !== 'COUNT' &&
          (typeof childField !== 'string' || childField.length === 0)
        ) {
          throw new Error(
            `Aggregation ${aggregationIndex} in definition ${definitionIndex} with type ${type} requires childField`,
          );
        }

        if (filters && !Array.isArray(filters)) {
          throw new Error(
            `Aggregation ${aggregationIndex} in definition ${definitionIndex} has invalid filters shape`,
          );
        }

        return filters ?? [];
      }),
    ];

    filtersToValidate.forEach((filter, filterIndex) => {
      if (!isObject(filter)) {
        throw new Error(
          `Filter ${filterIndex} in definition ${definitionIndex} must be an object`,
        );
      }

      const { field, operator } = filter as FilterConfig;

      if (typeof field !== 'string' || field.trim().length === 0) {
        throw new Error(
          `Filter ${filterIndex} in definition ${definitionIndex} missing field`,
        );
      }

      if (!operatorSet.has(operator)) {
        throw new Error(
          `Filter ${filterIndex} in definition ${definitionIndex} has unsupported operator ${operator}`,
        );
      }
    });
  });
};

const collectValuesByKey = (
  value: unknown,
  key: string,
  result: Set<string>,
): void => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectValuesByKey(entry, key, result));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  Object.entries(value).forEach(([currentKey, entryValue]) => {
    if (
      currentKey === key &&
      typeof entryValue === 'string' &&
      entryValue.trim().length > 0
    ) {
      result.add(entryValue);
      return;
    }

    collectValuesByKey(entryValue, key, result);
  });
};

export const extractRelationValues = (
  params: unknown,
  relationField: string,
): Set<string> => {
  const values = new Set<string>();
  collectValuesByKey(params, relationField, values);
  return values;
};

export const resolveRollupConfig = (): RollupConfig => {
  const override =
    process.env.ROLLUP_ENGINE_CONFIG ??
    process.env.ROLLUPS_CONFIG ??
    process.env.CALCULATE_ROLLUPS_CONFIG;

  if (override) {
    try {
      const parsed = JSON.parse(override) as unknown;
      validateRollupConfig(parsed);
      return parsed as RollupConfig;
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';
      throw new Error(
        `Unable to parse rollup configuration override (reason: ${reason})`,
      );
    }
  }

  const config = defaultRollupConfig;
  validateRollupConfig(config);
  return config;
};
