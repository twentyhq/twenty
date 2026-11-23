import {
  AggregateOperations,
  type FieldMetadataRollupSettings,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { buildRollupValueSqlExpression } from 'src/engine/core-modules/rollup-field/utils/build-rollup-value-sql-expression.util';

export const buildRollupAggregateSqlExpression = ({
  settings: { aggregateOperation, resultType },
  childObjectNameSingular,
  aggregatedColumnName,
}: {
  settings: Pick<
    FieldMetadataRollupSettings,
    'aggregateOperation' | 'resultType'
  >;
  childObjectNameSingular: string;
  aggregatedColumnName: string | null;
}): string =>
  buildRollupValueSqlExpression({
    resultType,
    expression:
      aggregateOperation === AggregateOperations.COUNT ||
      !isDefined(aggregatedColumnName)
        ? 'COUNT(*)'
        : `${aggregateOperation}(${escapeIdentifier(childObjectNameSingular)}.${escapeIdentifier(aggregatedColumnName)})`,
  });
